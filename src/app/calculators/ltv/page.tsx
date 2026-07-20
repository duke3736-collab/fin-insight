"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type BuyerType = "first_time" | "single_house" | "multi_house";
type RegionType = "regulated" | "non_regulated"; // 규제지역(강남3구/용산) vs 비규제지역
type LocationRegion = "seoul" | "overcrowded" | "metropolitan" | "other";

export default function LtvCalculatorPage() {
  // Inputs
  const [housePriceStr, setHousePriceStr] = useState("800,000,000"); // 주택 평가가액
  const [buyerType, setBuyerType] = useState<BuyerType>("single_house");
  const [regionType, setRegionType] = useState<RegionType>("non_regulated");
  const [seniorDebtStr, setSeniorDebtStr] = useState("0"); // 선순위 채권 및 임대보증금

  // 방공제 옵션
  const [useMciMcg, setUseMciMcg] = useState(true); // MCI/MCG 가입으로 방공제 면제 (기본 true)
  const [locationRegion, setLocationRegion] = useState<LocationRegion>("seoul");
  const [roomCount, setRoomCount] = useState<number>(1);

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setHousePriceStr(formatNumber(Math.min(num, 100000000000))); // 1000억 제한
  };

  const handleSeniorDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setSeniorDebtStr(formatNumber(Math.min(num, 100000000000)));
  };

  const setQuickPrice = (val: number) => setHousePriceStr(formatNumber(val));

  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    return result.trim() + "원";
  };

  // 방공제 금액 (지역별 소액임차보증금 최우선변제금)
  const roomDeductionPerRoom = useMemo(() => {
    switch (locationRegion) {
      case "seoul":
        return 55000000; // 서울 5,500만 원
      case "overcrowded":
        return 48000000; // 과밀억제권역/세종/용인/화성/김포 4,800만 원
      case "metropolitan":
        return 28000000; // 광역시/안산/파주/평택 등 2,800만 원
      default:
        return 25000000; // 기타 2,500만 원
    }
  }, [locationRegion]);

  const totalRoomDeduction = useMciMcg ? 0 : roomDeductionPerRoom * roomCount;

  // LTV 계산 로직
  const ltvResult = useMemo(() => {
    const price = parseInputNumber(housePriceStr);
    const seniorDebt = parseInputNumber(seniorDebtStr);

    if (price <= 0) {
      return {
        price: 0,
        ltvRate: 0,
        baseMaxLoan: 0,
        roomDeduction: 0,
        seniorDebt: 0,
        finalMaxLoan: 0,
        effectiveLtvRate: 0,
        isFirstTimeCapApplied: false,
      };
    }

    // 1. 규제 LTV 비율 결정
    let ltvRate = 0.7; // 기본 70%
    let isFirstTimeCapApplied = false;

    if (buyerType === "first_time") {
      ltvRate = 0.8; // 생애최초 80%
    } else if (buyerType === "single_house") {
      ltvRate = regionType === "regulated" ? 0.5 : 0.7;
    } else {
      // 다주택자
      ltvRate = regionType === "regulated" ? 0.3 : 0.6;
    }

    // 2. 기본 한도 계산 (생애최초 6억 한도 캡 반영)
    let baseMaxLoan = Math.floor(price * ltvRate);

    if (buyerType === "first_time" && baseMaxLoan > 600000000) {
      baseMaxLoan = 600000000;
      isFirstTimeCapApplied = true;
    }

    // 3. 최종 실 대출 한도 (방공제 + 선순위 차감)
    const finalMaxLoan = Math.max(0, baseMaxLoan - totalRoomDeduction - seniorDebt);
    const effectiveLtvRate = price > 0 ? (finalMaxLoan / price) * 100 : 0;

    return {
      price,
      ltvRate: ltvRate * 100,
      baseMaxLoan,
      roomDeduction: totalRoomDeduction,
      seniorDebt,
      finalMaxLoan,
      effectiveLtvRate,
      isFirstTimeCapApplied,
    };
  }, [housePriceStr, buyerType, regionType, seniorDebtStr, totalRoomDeduction]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 mb-3">
            2026년 최신 부동산 대출 규제 정책 완벽 산출
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            🏠 2026년 LTV & 주택담보대출 한도 계산기
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl leading-relaxed">
            주택 시세(KB시세), 주택 보유 수, 규제지역 여부에 따른 <strong>법정 LTV 비율(50%~80%)</strong>과 
            <strong>방공제(소액임차보증금/MCI/MCG)</strong>를 차감한 진짜 실 대출 가능 금액을 즉시 확인해보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 주택 평가가액 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">
                  주택 시세 / 평가가액 (KB시세 기준)
                </label>
                <a
                  href="https://kbland.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  KB시세 조회 ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={housePriceStr}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
              {housePriceStr && (
                <div className="mt-1 text-right text-xs font-bold text-emerald-600">
                  ≈ {formatKRWText(parseInputNumber(housePriceStr))}
                </div>
              )}

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[300000000, 500000000, 700000000, 900000000, 1200000000, 1500000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setQuickPrice(val)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +{val / 100000000}억
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 주택 구입 및 소유 상태 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                주택 구매 조건 및 주택 수 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBuyerType("first_time")}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                    buyerType === "first_time"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ✨ 생애 최초 구입
                  <span className="block text-[10px] font-normal opacity-90 mt-0.5">LTV 80% (최대 6억)</span>
                </button>

                <button
                  onClick={() => setBuyerType("single_house")}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                    buyerType === "single_house"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🏡 무주택 / 1주택자
                  <span className="block text-[10px] font-normal opacity-90 mt-0.5">LTV 50~70%</span>
                </button>

                <button
                  onClick={() => setBuyerType("multi_house")}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                    buyerType === "multi_house"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🏢 다주택자 (2주택+)
                  <span className="block text-[10px] font-normal opacity-90 mt-0.5">LTV 30~60%</span>
                </button>
              </div>
            </div>

            {/* 3. 규제 지역 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                부동산 소재지 규제지역 여부
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRegionType("non_regulated")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    regionType === "non_regulated"
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🌳 비규제지역 (서울 대부분 / 기타)
                </button>
                <button
                  onClick={() => setRegionType("regulated")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    regionType === "regulated"
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🔒 규제지역 (강남/서초/송파/용산)
                </button>
              </div>
            </div>

            {/* 4. 선순위 채권 및 세입자 보증금 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                선순위 채권액 및 기존 세입자 보증금 (선택 입력)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={seniorDebtStr}
                  onChange={handleSeniorDebtChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-bold text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  원
                </span>
              </div>
            </div>

            {/* 5. 방공제(소액임차보증금/MCI/MCG) 세부 옵션 */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-900 block">
                    MCI / MCG 보증보험 가입 (방공제 면제)
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    보증보험 가입 시 방공제 차감 없이 LTV 풀 한도 대출 가능
                  </span>
                </div>
                <button
                  onClick={() => setUseMciMcg(!useMciMcg)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    useMciMcg ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      useMciMcg ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {!useMciMcg && (
                <div className="space-y-3 pt-2 border-t border-emerald-200/60 text-xs">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">
                      소재 지역 선택 (최우선변제 방공제액)
                    </label>
                    <select
                      value={locationRegion}
                      onChange={(e) => setLocationRegion(e.target.value as LocationRegion)}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="seoul">서울특별시 (5,500만 원/방)</option>
                      <option value="overcrowded">과밀억제권역/세종/용인/화성/김포 (4,800만 원/방)</option>
                      <option value="metropolitan">광역시/안산/파주/평택 등 (2,800만 원/방)</option>
                      <option value="other">기타 지역 (2,500만 원/방)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">
                      방 개수 (차감 개수)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setRoomCount(cnt)}
                          className={`flex-1 py-1.5 rounded-lg border font-bold ${
                            roomCount === cnt
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          {cnt}개 ({formatNumber((roomDeductionPerRoom * cnt) / 10000)}만 원 차감)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 LTV 대출 가능 한도 결과</span>
              </h2>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                LTV {ltvResult.ltvRate}% 적용
              </span>
            </div>

            {/* Main Result Display */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-6 text-white space-y-3 relative overflow-hidden">
              <span className="text-xs text-teal-200 font-bold block">
                최종 실 대출 가능 한도 금액
              </span>
              <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
                {formatNumber(ltvResult.finalMaxLoan)}
                <span className="text-xl font-normal text-white ml-1">원</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold pt-1">
                ≈ {formatKRWText(ltvResult.finalMaxLoan)}
              </p>
              {ltvResult.isFirstTimeCapApplied && (
                <span className="inline-block text-[10px] text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-500/30">
                  ⚠️ 생애최초 최대 한도 6억 원 캡 적용됨
                </span>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>주택 시세 / 평가가액</span>
                <span className="font-bold text-slate-800">{formatNumber(ltvResult.price)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>법정 LTV 비율 한도</span>
                <span className="font-bold text-emerald-600">{ltvResult.ltvRate}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>LTV 이론상 최대 한도</span>
                <span className="font-bold text-slate-800">{formatNumber(ltvResult.baseMaxLoan)} 원</span>
              </div>
              {ltvResult.roomDeduction > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>방공제 차감액 (소액임차)</span>
                  <span className="font-bold">-{formatNumber(ltvResult.roomDeduction)} 원</span>
                </div>
              )}
              {ltvResult.seniorDebt > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>선순위 채권 / 보증금 차감</span>
                  <span className="font-bold">-{formatNumber(ltvResult.seniorDebt)} 원</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2 font-bold">
                <span>실제 적용 LTV 비율</span>
                <span className="text-emerald-700">{ltvResult.effectiveLtvRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 LTV & 주택담보대출 한도 계산기 - FinInsight"
                description={`내 예상 주택담보대출 한도: 약 ${formatKRWText(ltvResult.finalMaxLoan)} (LTV ${ltvResult.ltvRate}%)! 실시간 LTV 한도를 확인해보세요.`}
                kakaoAppKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Banner */}
      <div className="my-8">
        <AdSenseBanner dataAdSlot="1234567890" />
      </div>

      {/* Info & FAQ Guide Section */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
            📖 LTV(주택담보인정비율) 및 대출 한도 규제 완벽 정리
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            LTV(Loan to Value)는 주택의 평가가액(KB시세 또는 감정가) 대비 빌릴 수 있는 주택담보대출 금액의 비율을 뜻합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                ✨ 생애최초 주택구입자 혜택
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                생애 최초로 주택을 구입하는 무주택 세대주는 지역 상관없이 <strong>LTV 80%</strong>까지 대출이 가능합니다. (단, 최대 한도 6억 원 제한)
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🛡️ 방공제(방빼기)와 MCI/MCG
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                소액임차보증금 최우선변제금액을 대출 한도에서 차감하는 것을 방공제라고 합니다. <strong>MCI(모기지신용보험)</strong> 또는 <strong>MCG(모기지신용보증)</strong>에 가입하면 방공제 차감 없이 LTV 풀 한도를 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-lg font-black text-slate-800">
            ❓ 자주 묻는 질문 (FAQ)
          </h3>

          <div className="space-y-3">
            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 주택 평가가액 기준은 실매매가인가요, KB시세인가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                은행 대출 시 LTV 산정 기준은 **KB부동산 시세(일반평균가)**가 우선 적용되며, KB시세가 없는 신축 아파트나 빌라의 경우 감정평가액 또는 공시가격이 기준이 됩니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. LTV 한도가 남아도 대출이 다 안 나올 수 있나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                네, 그렇습니다. LTV 한도가 충분하더라도 개인의 연소득과 기존 부채에 따른 **DSR(40%) / DTI(60%) 한도**를 초과하면 대출 한도가 감액될 수 있습니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 대출 및 세금 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/dsr"
              className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              📊 2026년 DSR & 대출한도 계산기
            </Link>
            <Link
              href="/calculators/real-estate-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏠 부동산 취득세 계산기
            </Link>
            <Link
              href="/calculators/property-tax"
              className="px-3 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors"
            >
              🏢 2026년 재산세 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 규제지역 LTV 한도 및 방공제 MCI 모기지보험 완벽 활용법"
          url="https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%eb%8c%80%ec%b6%9c-ltv-%ea%b3%84%ec%82%b0%ea%b8%b0/"
        />
      </div>
    </div>
  );
}
