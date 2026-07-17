"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

// 지역구분 상수
const REGION_LABELS = {
  seoul: "서울",
  gyeonggi: "경기",
  metropolitan: "광역시·세종·창원",
  other: "그 외 지역 (농어촌 등)",
};

// 지역별 기본재산액 (공제액)
const BASIC_PROPERTY_DEDUCTION = {
  seoul: 99000000,
  gyeonggi: 80000000,
  metropolitan: 77000000,
  other: 53000000,
};

// 지역별 주거용재산 한도액
const RES_PROPERTY_LIMIT = {
  seoul: 172000000,
  gyeonggi: 151000000,
  metropolitan: 146000000,
  other: 112000000,
};

// 가구원수별 급여 선정기준액 (원)
const BENEFIT_THRESHOLDS = {
  "2026": {
    "1": { livelihood: 820556, medical: 1025695, housing: 1230834, education: 1282119 },
    "2": { livelihood: 1343773, medical: 1679717, housing: 2015660, education: 2099646 },
    "3": { livelihood: 1714892, medical: 2143614, housing: 2572337, education: 2679518 },
    "4": { livelihood: 2078316, medical: 2597895, housing: 3117474, education: 3247369 },
    "5": { livelihood: 2418150, medical: 3022688, housing: 3627225, education: 3778360 },
    "6": { livelihood: 2737905, medical: 3422381, housing: 4106857, education: 4277976 },
  },
  "2025": {
    "1": { livelihood: 765444, medical: 956805, housing: 1148166, education: 1196007 },
    "2": { livelihood: 1258451, medical: 1573063, housing: 1887676, education: 1966329 },
    "3": { livelihood: 1608113, medical: 2010141, housing: 2412169, education: 2512677 },
    "4": { livelihood: 1951287, medical: 2439109, housing: 2926931, education: 3048887 },
    "5": { livelihood: 2274621, medical: 2843277, housing: 3411932, education: 3554096 },
    "6": { livelihood: 2580738, medical: 3225922, housing: 3871106, education: 4032403 },
  },
};

export default function BasicLivelihoodCalculatorPage() {
  const [year, setYear] = useState<"2026" | "2025">("2026");
  const [householdSize, setHouseholdSize] = useState<"1" | "2" | "3" | "4" | "5" | "6">("1");
  const [region, setRegion] = useState<"seoul" | "gyeonggi" | "metropolitan" | "other">("seoul");

  // 소득 입력값 (문자열로 관리 후 연산시 파싱)
  const [earnedIncomeStr, setEarnedIncomeStr] = useState("1,200,000");
  const [businessIncomeStr, setBusinessIncomeStr] = useState("0");
  const [otherIncomeStr, setOtherIncomeStr] = useState("0");
  const [householdExpenseStr, setHouseholdExpenseStr] = useState("0");

  // 재산 및 부채 입력값
  const [resPropertyStr, setResPropertyStr] = useState("80,000,000");
  const [genPropertyStr, setGenPropertyStr] = useState("0");
  const [finPropertyStr, setFinPropertyStr] = useState("10,000,000");
  const [debtStr, setDebtStr] = useState("15,000,000");

  // 자동차 입력값
  const [carType, setCarType] = useState<"none" | "general" | "reduced" | "exempt">("none");
  const [carValStr, setCarValStr] = useState("0");

  // 계산 결과 상태
  const [isCalculated, setIsCalculated] = useState(false);
  const [result, setResult] = useState({
    incomeEval: 0,
    resPropertyFinal: 0,
    resPropertyExcess: 0,
    genPropertyFinal: 0,
    finPropertyAdjusted: 0,
    baseDeduction: 0,
    totalDeduction: 0,
    resPropertyRem: 0,
    genPropertyRem: 0,
    finPropertyRem: 0,
    resPropertyConv: 0,
    genPropertyConv: 0,
    finPropertyConv: 0,
    carConv: 0,
    totalPropertyConv: 0,
    incomeRecognition: 0,
  });

  // 포맷터 유틸
  const formatNumber = (num: number) =>
    Math.floor(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setter("0");
      return;
    }
    if (!/^\d+$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    setter(formatNumber(parseInt(value || "0", 10)));
  };

  const handleCalculate = () => {
    const earned = parseInt(removeCommas(earnedIncomeStr) || "0", 10);
    const business = parseInt(removeCommas(businessIncomeStr) || "0", 10);
    const other = parseInt(removeCommas(otherIncomeStr) || "0", 10);
    const expense = parseInt(removeCommas(householdExpenseStr) || "0", 10);

    const res = parseInt(removeCommas(resPropertyStr) || "0", 10);
    const gen = parseInt(removeCommas(genPropertyStr) || "0", 10);
    const fin = parseInt(removeCommas(finPropertyStr) || "0", 10);
    const debt = parseInt(removeCommas(debtStr) || "0", 10);
    const carVal = parseInt(removeCommas(carValStr) || "0", 10);

    // 1. 소득평가액 계산
    // 근로소득 및 사업소득 30% 기본공제 적용 (의료/생계 등 30% 동일 적용)
    const earnedEval = Math.floor(earned * 0.7);
    const businessEval = Math.floor(business * 0.7);
    const incomeEval = Math.max(0, earnedEval + businessEval + other - expense);

    // 2. 재산의 소득환산액 계산
    // 2-1) 금융재산 생활준비금 공제 (500만 원)
    const finPropertyAdjusted = Math.max(0, fin - 5000000);

    // 2-2) 주거용재산 한도 초과분 일반재산 이관
    const resLimit = RES_PROPERTY_LIMIT[region];
    const resPropertyFinal = Math.min(res, resLimit);
    const resPropertyExcess = Math.max(0, res - resLimit);

    // 2-3) 일반재산 결정 (초과 주거용재산 + 일반재산)
    // 차량 타입이 감면(4.17%)인 경우 일반재산에 가액 합산하여 공제 기회 제공
    let genPropertyFinal = gen + resPropertyExcess;
    if (carType === "reduced") {
      genPropertyFinal += carVal;
    }

    // 2-4) 공제금액 풀 (지역별 기본재산액 + 부채)
    const baseDeduction = BASIC_PROPERTY_DEDUCTION[region];
    const totalDeduction = baseDeduction + debt;

    // 2-5) 순차적 공제 적용 (주거용 -> 일반 -> 금융)
    let remDeduction = totalDeduction;

    // 주거용재산 공제
    const subRes = Math.min(resPropertyFinal, remDeduction);
    const resPropertyRem = resPropertyFinal - subRes;
    remDeduction -= subRes;

    // 일반재산 공제
    const subGen = Math.min(genPropertyFinal, remDeduction);
    const genPropertyRem = genPropertyFinal - subGen;
    remDeduction -= subGen;

    // 금융재산 공제
    const subFin = Math.min(finPropertyAdjusted, remDeduction);
    const finPropertyRem = finPropertyAdjusted - subFin;
    remDeduction -= subFin;

    // 2-6) 소득환산액 환산율 적용 (월 요율)
    const resPropertyConv = Math.floor(resPropertyRem * 0.0104);
    const genPropertyConv = Math.floor(genPropertyRem * 0.0417);
    const finPropertyConv = Math.floor(finPropertyRem * 0.0626);

    // 2-7) 자동차 100% 소득환산 가액 (일반 차량인 경우 다이렉트 합산)
    const carConv = carType === "general" ? carVal : 0;

    const totalPropertyConv = resPropertyConv + genPropertyConv + finPropertyConv + carConv;

    // 3. 소득인정액 산출
    const incomeRecognition = incomeEval + totalPropertyConv;

    setResult({
      incomeEval,
      resPropertyFinal,
      resPropertyExcess,
      genPropertyFinal,
      finPropertyAdjusted,
      baseDeduction,
      totalDeduction,
      resPropertyRem,
      genPropertyRem,
      finPropertyRem,
      resPropertyConv,
      genPropertyConv,
      finPropertyConv,
      carConv,
      totalPropertyConv,
      incomeRecognition,
    });

    setIsCalculated(true);
  };

  // 차량타입 변경 시 차량가액 초기화
  useEffect(() => {
    if (carType === "none" || carType === "exempt") {
      setCarValStr("0");
    }
  }, [carType]);

  const activeThresholds = BENEFIT_THRESHOLDS[year][householdSize];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">기초생활수급자 소득인정액 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      {/* Main Container */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        </div>

        <div className="relative p-6 md:p-10 text-slate-200">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 text-2xl">
              🏠
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              기초생활수급자 소득인정액 모의계산기
            </h1>
            <p className="text-slate-300 text-sm font-medium">
              가구의 소득과 재산을 월 소득으로 환산하여 모의 수급 가능성을 진단합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column: Form Inputs */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📋 정보 입력</h2>

              {/* 연도 및 가구원 수 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">기준 연도</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as "2026" | "2025")}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="2026">2026년 기준</option>
                    <option value="2025">2025년 기준</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">가구원 수</label>
                  <select
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="1">1인 가구</option>
                    <option value="2">2인 가구</option>
                    <option value="3">3인 가구</option>
                    <option value="4">4인 가구</option>
                    <option value="5">5인 가구</option>
                    <option value="6">6인 가구</option>
                  </select>
                </div>
              </div>

              {/* 거주 지역 */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">거주 지역</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="seoul">서울특별시</option>
                  <option value="gyeonggi">경기도</option>
                  <option value="metropolitan">광역시, 세종특별자치시, 창원시</option>
                  <option value="other">그 외 지역 (중소도시, 농어촌 등)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  ※ 주거용재산 한도 및 기본재산액 공제에 큰 영향을 주므로 정확히 선택해주세요.
                </p>
              </div>

              {/* 소득 정보 */}
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">💵 월 실제 소득 (세전 기준)</p>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">근로소득 (월)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={earnedIncomeStr}
                      onChange={handleCurrencyChange(setEarnedIncomeStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-emerald-400/80 mt-1">💡 30% 기본 공제가 자동 적용됩니다. (실제 반영액: {formatNumber(parseInt(removeCommas(earnedIncomeStr) || "0", 10) * 0.7)}원)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">사업소득 (월)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={businessIncomeStr}
                      onChange={handleCurrencyChange(setBusinessIncomeStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-emerald-400/80 mt-1">💡 30% 기본 공제가 자동 적용됩니다.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">기타소득 (월)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={otherIncomeStr}
                      onChange={handleCurrencyChange(setOtherIncomeStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">※ 공적 연금, 임대 소득, 고정 사적이전소득 등 공제가 없는 소득 합산</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">가구특성별 지출비용 (월)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={householdExpenseStr}
                      onChange={handleCurrencyChange(setHouseholdExpenseStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">※ 등록장애인의 재활의료비 등 증빙 가능한 가구 특성 지출액</p>
                </div>
              </div>

              {/* 자산 및 부채 정보 */}
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🏢 재산 및 부채 (공시지가 기준)</p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">주거용재산 (주택, 임차보증금 등)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={resPropertyStr}
                      onChange={handleCurrencyChange(setResPropertyStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-slate-400/80 mt-1">※ 실제 거주 주택 공시가 또는 임대차 계약서 보증금액</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">일반재산 (토지, 건물 등)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={genPropertyStr}
                      onChange={handleCurrencyChange(setGenPropertyStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">금융재산 (예적금, 주식, 보험 등)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={finPropertyStr}
                      onChange={handleCurrencyChange(setFinPropertyStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-emerald-400/80 mt-1">💡 가구당 500만 원 생활준비금 공제가 자동 차감됩니다.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">인정 부채 (대출금, 임대 보증금 등)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                    <input
                      type="text"
                      value={debtStr}
                      onChange={handleCurrencyChange(setDebtStr)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">※ 금융사 정식 대출 및 전세 임대 시 돌려줘야 할 전세보증금</p>
                </div>
              </div>

              {/* 자동차 정보 */}
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🚗 자동차 소득환산</p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="carType"
                      checked={carType === "none"}
                      onChange={() => setCarType("none")}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-200">차량 없음 또는 비대상</span>
                  </label>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="carType"
                      checked={carType === "reduced"}
                      onChange={() => setCarType("reduced")}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-200 flex-1">
                      감면 대상 차량 (일반재산 4.17% 환산율 적용)
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        - 2,000cc 미만 승용차 & 차량가액 500만원 미만
                        <span className="block">- 10년 이상 노후 차량 등</span>
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="carType"
                      checked={carType === "general"}
                      onChange={() => setCarType("general")}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-200 flex-1">
                      일반 차량 (월 100% 환산율 적용)
                      <span className="block text-[9px] text-red-400/90 mt-0.5">
                        ⚠️ 차량 가액 전체가 고스란히 월 소득인정액으로 합산되므로 통과가 매우 어렵습니다.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="carType"
                      checked={carType === "exempt"}
                      onChange={() => setCarType("exempt")}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-200 flex-1">
                      완전 제외 차량 (0% 환산)
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        - 장애인 차량(가구당 1대), 생업용 화물차/택시 등
                      </span>
                    </span>
                  </label>
                </div>

                {(carType === "general" || carType === "reduced") && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">현재 차량 가액 (보험개발원 기준)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₩</span>
                      <input
                        type="text"
                        value={carValStr}
                        onChange={handleCurrencyChange(setCarValStr)}
                        className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-2 pl-7 pr-7 text-xs text-white font-bold text-right outline-none focus:border-emerald-400 transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">원</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 계산하기 버튼 */}
              <button
                onClick={handleCalculate}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer text-base"
              >
                소득인정액 계산하기 🚀
              </button>
            </div>

            {/* Right Column: Calculations & Results */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📊 진단 결과</h2>

              {!isCalculated ? (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-800/20 border border-slate-800/80 rounded-3xl p-8 text-center text-slate-400">
                  <span className="text-4xl mb-3">💡</span>
                  <p className="text-sm font-semibold">입력창에 정보를 기입하고<br />&apos;계산하기&apos; 버튼을 클릭해주세요.</p>
                  <p className="text-xs text-slate-500 mt-2">입력하신 정보는 서버로 전송되지 않으며,<br />웹브라우저 내에서 안전하게 즉시 연산됩니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 핵심 결과 박스 */}
                  <div className="bg-slate-800/40 rounded-3xl p-6 border border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
                    
                    <p className="text-xs font-bold text-emerald-400 tracking-wider mb-2">예상 월 소득인정액</p>
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black">{formatNumber(result.incomeRecognition)}</span>
                      <span className="text-lg font-bold">원</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs">
                      <div>
                        <p className="text-slate-400 mb-0.5">① 소득평가액</p>
                        <p className="font-bold text-slate-200">{formatNumber(result.incomeEval)}원</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">② 재산의 소득환산액</p>
                        <p className="font-bold text-slate-200">{formatNumber(result.totalPropertyConv)}원</p>
                      </div>
                    </div>
                  </div>

                  {/* 급여별 수급 판정 */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">급여별 수급 자격 시뮬레이션</h3>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* 생계급여 */}
                      <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">생계급여</span>
                            <span className="text-[10px] text-slate-400">(중위 32% 이하)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">선정 기준: {formatNumber(activeThresholds.livelihood)}원 이하</p>
                        </div>
                        <div className="text-right">
                          {result.incomeRecognition <= activeThresholds.livelihood ? (
                            <div>
                              <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 mb-1">
                                수급 가능
                              </span>
                              <p className="text-[11px] font-bold text-emerald-400">
                                예상 수급액: ~{formatNumber(activeThresholds.livelihood - result.incomeRecognition)}원/월
                              </p>
                            </div>
                          ) : (
                            <span className="inline-block bg-slate-800 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                              초과 (대상 아님)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 의료급여 */}
                      <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">의료급여</span>
                            <span className="text-[10px] text-slate-400">(중위 40% 이하)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">선정 기준: {formatNumber(activeThresholds.medical)}원 이하</p>
                        </div>
                        <div className="text-right">
                          {result.incomeRecognition <= activeThresholds.medical ? (
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              수급 가능
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-800 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                              초과 (대상 아님)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 주거급여 */}
                      <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">주거급여</span>
                            <span className="text-[10px] text-slate-400">(중위 48% 이하)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">선정 기준: {formatNumber(activeThresholds.housing)}원 이하</p>
                        </div>
                        <div className="text-right">
                          {result.incomeRecognition <= activeThresholds.housing ? (
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              수급 가능
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-800 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                              초과 (대상 아님)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 교육급여 */}
                      <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">교육급여</span>
                            <span className="text-[10px] text-slate-400">(중위 50% 이하)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">선정 기준: {formatNumber(activeThresholds.education)}원 이하</p>
                        </div>
                        <div className="text-right">
                          {result.incomeRecognition <= activeThresholds.education ? (
                            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              수급 가능
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-800 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
                              초과 (대상 아님)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 재산 소득환산 상세 내역 */}
                  <div className="p-5 bg-slate-800/20 rounded-3xl border border-slate-800 space-y-3.5 text-xs text-slate-300">
                    <h4 className="font-bold text-white">🔍 재산 소득환산 상세 상세 내역</h4>
                    
                    <div className="space-y-2 border-b border-slate-800/60 pb-3">
                      <div className="flex justify-between">
                        <span>지역별 기본재산 공제액</span>
                        <span className="font-semibold text-slate-200">-{formatNumber(result.baseDeduction)}원 ({REGION_LABELS[region]})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>신고된 부채 공제액</span>
                        <span className="font-semibold text-slate-200">-{formatNumber(parseInt(removeCommas(debtStr) || "0", 10))}원</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>총 차감 공제풀액</span>
                        <span>-{formatNumber(result.totalDeduction)}원</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span>🏡 주거용재산 환산액</span>
                          <span className="block text-[10px] text-slate-500">한도내 가액 ({formatNumber(result.resPropertyFinal)}원) × 월 1.04%</span>
                        </div>
                        <span className="font-semibold text-slate-200">{formatNumber(result.resPropertyConv)}원/월</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <span>🏗️ 일반재산 환산액</span>
                          {carType === "reduced" ? (
                            <span className="block text-[10px] text-slate-500">(주거용한도초과분 + 일반재산 + 차량가액 {formatNumber(parseInt(removeCommas(carValStr) || "0", 10))}원) × 월 4.17%</span>
                          ) : (
                            <span className="block text-[10px] text-slate-500">(주거용한도초과분 + 일반재산) × 월 4.17%</span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-200">{formatNumber(result.genPropertyConv)}원/월</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <span>💳 금융재산 환산액</span>
                          <span className="block text-[10px] text-slate-500">(금융재산 - 생활준비금 500만 원 공제 적용 후) × 월 6.26%</span>
                        </div>
                        <span className="font-semibold text-slate-200">{formatNumber(result.finPropertyConv)}원/월</span>
                      </div>

                      {carType === "general" && (
                        <div className="flex justify-between items-start text-rose-400">
                          <div>
                            <span>⚠️ 일반 차량 100% 환산액</span>
                            <span className="block text-[10px] text-slate-500">차량 가액 전체가 월 소득인정액으로 직합산</span>
                          </div>
                          <span className="font-bold">{formatNumber(result.carConv)}원/월</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 주의 사항 / 안내 */}
          <div className="mt-12 pt-8 border-t border-slate-800 text-slate-400 text-xs leading-relaxed space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">💡 이용 안내 및 필수 안내사항</h3>
            <p>
              1. 본 계산 결과는 입력하신 소득과 재산 자료를 단순 수식에 대입하여 산출한 **모의 가계산 결과**입니다. 실제 보건복지부의 수급자 가부 판정 조사에서는 공적연금기관, 국세청, 시중은행, 금융감독원 등의 공적 정보망을 통합 조회하여 최종 산출되므로 본 결과와 차이가 발생할 수 있습니다.
            </p>
            <p>
              2. **부양의무자 기준:** 2026년 현재 생계급여 및 주거급여의 경우 부양의무자 기준이 대폭 완화되었으나, 세대 가구별 조건(예: 연 소득 1억 원 또는 재산 9억 원 초과 고소득/고재산 부양의무자가 있는 경우 등)에 따라 제한이 생길 수 있습니다. 의료급여의 경우 부양의무자 조건이 잔존합니다.
            </p>
            <p>
              3. 정확한 복지 자격 요건 판정을 원하신다면 거주하시는 지역의 **읍·면·동 행정복지센터(주민센터)**를 직접 방문하여 사전 상담을 받거나, 보건복지부 대표 콜센터 **국번 없이 129**를 통해 정밀 유선 상담을 받으시는 것이 가장 바람직합니다.
            </p>
            <div className="pt-2">
              <WordPressLink 
                title="복지로 공식 모의계산 서비스로 이동하기"
                url="https://www.bokjiro.go.kr/"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share / Social Buttons */}
      <div className="flex justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
        <ShareButtons 
          title="기초생활수급자 소득인정액 모의계산기 - FinInsight"
          description="나의 소득평가액과 재산소득환산액을 상세히 대입하여 2026년 기준 중위소득 급여(생계, 의료, 주거, 교육) 수급 자격을 즉시 모의 시뮬레이션 해보세요."
          kakaoAppKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}
        />
      </div>
    </div>
  );
}
