"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";

export default function EarnedIncomeTaxCreditPage() {
  // Household type: 'single', 'single_earner', 'dual_earner'
  const [householdType, setHouseholdType] = useState<"single" | "single_earner" | "dual_earner">("single");

  // Income Inputs (in 만원)
  const [myIncomeStr, setMyIncomeStr] = useState<string>("1,200");
  const [spouseIncomeStr, setSpouseIncomeStr] = useState<string>("0");

  // Children Count (for Child Tax Credit)
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Property / Asset Input (in 만원)
  const [assetsStr, setAssetsStr] = useState<string>("12,000"); // default 1.2억

  // Calculation Results
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);

  const [rawEitc, setRawEitc] = useState<number>(0); // EITC before asset deduction
  const [rawCtc, setRawCtc] = useState<number>(0); // CTC before asset deduction
  const [eitcAmount, setEitcAmount] = useState<number>(0);
  const [ctcAmount, setCtcAmount] = useState<number>(0);
  const [totalGrant, setTotalGrant] = useState<number>(0);

  const [incomeEligible, setIncomeEligible] = useState<boolean>(true);
  const [assetStatus, setAssetStatus] = useState<"full" | "reduced" | "excluded">("full");
  const [incomeLimit, setIncomeLimit] = useState<number>(2200);
  const [maxEitcLimit, setMaxEitcLimit] = useState<number>(165);
  const [incomeSection, setIncomeSection] = useState<"increasing" | "flat" | "decreasing" | "over">("flat");

  // Format utility
  const formatNumber = (num: number) => Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setter("");
      return;
    }
    if (!/^\d+$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    setter(formatNumber(parseInt(value || "0", 10)));
  };

  // Preset button handlers
  const handleIncomePreset = (valInMan: number) => {
    setMyIncomeStr(formatNumber(valInMan));
  };

  const handleAssetPreset = (valInMan: number) => {
    setAssetsStr(formatNumber(valInMan));
  };

  // Perform Calculation
  useEffect(() => {
    const myInc = parseInt(removeCommas(myIncomeStr) || "0", 10);
    const spouseInc = householdType === "single" ? 0 : parseInt(removeCommas(spouseIncomeStr) || "0", 10);
    const totInc = myInc + spouseInc;
    const assets = parseInt(removeCommas(assetsStr) || "0", 10);

    setTotalIncome(totInc);
    setTotalAssets(assets);

    // Household limits
    let limitInc = 2200;
    let maxEitc = 165;
    if (householdType === "single_earner") {
      limitInc = 3200;
      maxEitc = 285;
    } else if (householdType === "dual_earner") {
      limitInc = 3800;
      maxEitc = 330;
    }
    setIncomeLimit(limitInc);
    setMaxEitcLimit(maxEitc);

    // EITC Math
    let calculatedRawEitc = 0;
    let section: "increasing" | "flat" | "decreasing" | "over" = "flat";

    if (totInc <= 0 || totInc >= limitInc) {
      calculatedRawEitc = 0;
      section = totInc >= limitInc ? "over" : "increasing";
    } else if (householdType === "single") {
      // Single: 0~400, 400~900, 900~2200
      if (totInc < 400) {
        calculatedRawEitc = totInc * (165 / 400);
        section = "increasing";
      } else if (totInc <= 900) {
        calculatedRawEitc = 165;
        section = "flat";
      } else {
        calculatedRawEitc = 165 - (totInc - 900) * (165 / 1300);
        section = "decreasing";
      }
    } else if (householdType === "single_earner") {
      // Single Earner: 0~700, 700~1400, 1400~3200
      if (totInc < 700) {
        calculatedRawEitc = totInc * (285 / 700);
        section = "increasing";
      } else if (totInc <= 1400) {
        calculatedRawEitc = 285;
        section = "flat";
      } else {
        calculatedRawEitc = 285 - (totInc - 1400) * (285 / 1800);
        section = "decreasing";
      }
    } else {
      // Dual Earner: 0~800, 800~1700, 1700~3800
      if (totInc < 800) {
        calculatedRawEitc = totInc * (330 / 800);
        section = "increasing";
      } else if (totInc <= 1700) {
        calculatedRawEitc = 330;
        section = "flat";
      } else {
        calculatedRawEitc = 330 - (totInc - 1700) * (330 / 2100);
        section = "decreasing";
      }
    }

    calculatedRawEitc = Math.max(0, calculatedRawEitc);
    setRawEitc(calculatedRawEitc);
    setIncomeSection(section);

    // Child Tax Credit (CTC) Math
    // Income limit for CTC is 7,000만원. Max 100만원 per child.
    let calculatedRawCtc = 0;
    const effChildren = householdType === "single" ? 0 : childrenCount;

    if (effChildren > 0 && totInc < 7000) {
      let perChildCtc = 0;
      if (householdType === "single_earner") {
        if (totInc <= 2100) {
          perChildCtc = 100;
        } else {
          perChildCtc = Math.max(50, 100 - (totInc - 2100) * (50 / 4900));
        }
      } else if (householdType === "dual_earner") {
        if (totInc <= 2500) {
          perChildCtc = 100;
        } else {
          perChildCtc = Math.max(50, 100 - (totInc - 2500) * (50 / 4500));
        }
      }
      calculatedRawCtc = perChildCtc * effChildren;
    }
    setRawCtc(calculatedRawCtc);

    // Income eligibility check
    const isIncOk = totInc > 0 && (totInc < limitInc || calculatedRawCtc > 0);
    setIncomeEligible(isIncOk);

    // Asset status & deduction check
    let aStatus: "full" | "reduced" | "excluded" = "full";
    let assetMultiplier = 1.0;

    if (assets >= 24000) {
      aStatus = "excluded";
      assetMultiplier = 0;
    } else if (assets >= 17000) {
      aStatus = "reduced";
      assetMultiplier = 0.5;
    } else {
      aStatus = "full";
      assetMultiplier = 1.0;
    }
    setAssetStatus(aStatus);

    // Final Amounts in Won (converting 만원 to 원 or keeping in 만원 -> let's store in 원 for exact display)
    const finalEitcWon = Math.floor(calculatedRawEitc * assetMultiplier * 10000);
    const finalCtcWon = Math.floor(calculatedRawCtc * assetMultiplier * 10000);

    setEitcAmount(finalEitcWon);
    setCtcAmount(finalCtcWon);
    setTotalGrant(finalEitcWon + finalCtcWon);
    setIsCalculated(true);
  }, [householdType, myIncomeStr, spouseIncomeStr, childrenCount, assetsStr]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">홈</Link>
        <span>/</span>
        <Link href="/#life" className="hover:text-emerald-600 transition-colors">생활 계산기</Link>
        <span>/</span>
        <span className="text-slate-800">근로장려금 & 자녀장려금 계산기</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 mb-3 border border-white/20">
            <span>✨ 2026년 국세청 최신 기준 반영</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
            2026 근로장려금 & 자녀장려금<br className="hidden sm:inline" /> 모의계산기
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            가구 유형별 총소득 요건, 재산 합계액(1.7억/2.4억 감액 기준), 부양자녀 수에 따른 예상 근로·자녀장려금을 1초 만에 확인해 보세요.
          </p>
        </div>
      </div>

      <AdSenseBanner dataAdSlot="1234567890" />

      {/* Calculator Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
            <span>📝 조건 입력</span>
          </h2>

          {/* 1. Household Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              1. 가구 유형 선택 <span className="text-emerald-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setHouseholdType("single"); setSpouseIncomeStr("0"); setChildrenCount(0); }}
                className={`py-3 px-2 rounded-2xl border text-xs sm:text-sm font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  householdType === "single"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                }`}
              >
                <span className="text-base">👤</span>
                <span>단독 가구</span>
              </button>

              <button
                type="button"
                onClick={() => setHouseholdType("single_earner")}
                className={`py-3 px-2 rounded-2xl border text-xs sm:text-sm font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  householdType === "single_earner"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                }`}
              >
                <span className="text-base">👨‍👩‍👦</span>
                <span>홑벌이 가구</span>
              </button>

              <button
                type="button"
                onClick={() => setHouseholdType("dual_earner")}
                className={`py-3 px-2 rounded-2xl border text-xs sm:text-sm font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  householdType === "dual_earner"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                }`}
              >
                <span className="text-base">👩‍💼👨‍💼</span>
                <span>맞벌이 가구</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {householdType === "single" && "• 배우자, 18세 미만 부양자녀, 70세 이상 직계존속이 모두 없는 가구 (기준 총소득 2,200만원 미만)"}
              {householdType === "single_earner" && "• 배우자 소득이 300만원 미만이거나, 부양자녀 또는 70세 이상 부모님이 있는 가구 (기준 총소득 3,200만원 미만)"}
              {householdType === "dual_earner" && "• 신청인과 배우자 각각 총급여액 등이 300만원 이상인 가구 (기준 총소득 3,800만원 미만)"}
            </p>
          </div>

          {/* 2. Income Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-700">
                  2. {householdType === "dual_earner" ? "신청인 연간 총소득" : "본인/가구 연간 총소득"} (만원)
                </label>
                <span className="text-xs text-emerald-600 font-semibold">
                  {myIncomeStr ? `${formatNumber(parseInt(removeCommas(myIncomeStr) || "0", 10) * 10000)} 원` : "0원"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={myIncomeStr}
                  onChange={handleCurrencyChange(setMyIncomeStr)}
                  placeholder="예: 1,200"
                  className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-base"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">만원</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[500, 1000, 1500, 2000, 3000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleIncomePreset(preset)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                  >
                    +{preset >= 1000 ? `${preset / 1000}천` : preset}만
                  </button>
                ))}
              </div>
            </div>

            {/* Spouse Income (shown for single_earner or dual_earner) */}
            {householdType !== "single" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    배우자 연간 총소득 (만원)
                  </label>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {spouseIncomeStr ? `${formatNumber(parseInt(removeCommas(spouseIncomeStr) || "0", 10) * 10000)} 원` : "0원"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={spouseIncomeStr}
                    onChange={handleCurrencyChange(setSpouseIncomeStr)}
                    placeholder={householdType === "single_earner" ? "300만원 미만 권장" : "예: 1,000"}
                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-base"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">만원</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dependent Children Count (for CTC) */}
          {householdType !== "single" && (
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-slate-700">
                3. 18세 미만 부양 자녀 수 (자녀장려금 계산용)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setChildrenCount(cnt)}
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      childrenCount === cnt
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                    }`}
                  >
                    {cnt === 4 ? "4명 이상" : `${cnt}명`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                • 18세 미만(연간 소득금액 100만원 이하) 자녀 1인당 최대 100만원 산출 (총소득 7,000만원 미만)
              </p>
            </div>
          )}

          {/* 4. Total Asset Input */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-slate-700">
                {householdType === "single" ? "3." : "4."} 가구원 전체 재산 합계액 (만원)
              </label>
              <span className="text-xs font-semibold text-slate-500">
                {assetsStr ? `${(parseInt(removeCommas(assetsStr) || "0", 10) / 10000).toFixed(2)} 억원` : "0원"}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={assetsStr}
                onChange={handleCurrencyChange(setAssetsStr)}
                placeholder="예: 12,000 (1억 2천만원)"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">만원</span>
            </div>
            {/* Asset Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleAssetPreset(10000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
              >
                1억원 (100% 지급)
              </button>
              <button
                type="button"
                onClick={() => handleAssetPreset(15000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
              >
                1.5억원 (100% 지급)
              </button>
              <button
                type="button"
                onClick={() => handleAssetPreset(18000)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors"
              >
                1.8억원 (50% 감액)
              </button>
              <button
                type="button"
                onClick={() => handleAssetPreset(25000)}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
              >
                2.5억원 (지급 제외)
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-normal mt-1">
              ※ 주택, 토지, 건물, 승용자동차, 전세금, 금융자산, 분양권 등 가구원 재산 합계 (부채 차감 없음)
            </p>
          </div>
        </div>

        {/* Right Calculation Output Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-6 relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">최종 예상 지급 결과</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                2026 모의계산
              </span>
            </div>

            {/* Total Grant Big Number */}
            <div className="text-center py-2">
              <p className="text-xs text-slate-400 font-medium mb-1">총 예상 지급액 (근로 + 자녀장려금)</p>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-emerald-400">
                {formatNumber(totalGrant)} <span className="text-2xl font-bold text-white">원</span>
              </h3>
              {assetStatus === "reduced" && (
                <p className="text-xs text-amber-400 font-bold mt-2 bg-amber-950/60 border border-amber-800/60 py-1 px-3 rounded-full inline-block">
                  ⚠️ 재산 1.7억~2.4억 미만 구간 (50% 감액 적용됨)
                </p>
              )}
              {assetStatus === "excluded" && (
                <p className="text-xs text-rose-400 font-bold mt-2 bg-rose-950/60 border border-rose-800/60 py-1 px-3 rounded-full inline-block">
                  🚫 재산 2.4억원 이상으로 지급 대상 제외
                </p>
              )}
              {incomeSection === "over" && assetStatus !== "excluded" && (
                <p className="text-xs text-rose-400 font-bold mt-2 bg-rose-950/60 border border-rose-800/60 py-1 px-3 rounded-full inline-block">
                  🚫 기준 총소득({incomeLimit}만원) 초과로 지급 대상 제외
                </p>
              )}
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  근로장려금 예상액
                </span>
                <span className="font-bold text-white">{formatNumber(eitcAmount)} 원</span>
              </div>

              {householdType !== "single" && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    자녀장려금 예상액 ({childrenCount}명)
                  </span>
                  <span className="font-bold text-indigo-300">{formatNumber(ctcAmount)} 원</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-700/50 text-xs text-slate-400">
                <span>가구 총소득 / 요건</span>
                <span className="font-semibold text-slate-200">
                  {formatNumber(totalIncome)}만 / {incomeLimit}만원 미만
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>가구 총재산 / 요건</span>
                <span className="font-semibold text-slate-200">
                  {(totalAssets / 10000).toFixed(2)}억 / 2.4억원 미만
                </span>
              </div>
            </div>

            {/* Application Guide Card */}
            <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-emerald-300 flex items-center gap-1">
                <span>📅 신청 및 지급 일정 안내</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>5월 정기신청</strong>: 5월 1일 ~ 5월 31일 (8월 말~9월 100% 지급)</li>
                <li>• <strong>9월 상반기 신청</strong>: 9월 1일 ~ 9월 15일 (12월 중 35% 지급)</li>
                <li>• <strong>3월 하반기 신청</strong>: 3월 1일 ~ 3월 15일 (6월 중 정산 지급)</li>
                <li className="text-slate-400 pt-1">※ 기한 후 신청(6월~11월) 시 산출액의 95% 지급</li>
              </ul>
            </div>

            {/* Share & Ad */}
            <div className="pt-2">
              <ShareButtons
                title="2026 근로장려금 & 자녀장려금 모의계산기 - FinInsight"
                description={`내 예상 근로장려금: ${formatNumber(totalGrant)}원! 1초 만에 확인해보세요.`}
                kakaoAppKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Slopes & Detailed Rules Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <span>💡 근로장려금 지급액 계산 공식 및 조건 상세 안내</span>
        </h2>

        {/* 3 Sections breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border transition-all ${
            incomeSection === "increasing" ? "border-emerald-500 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-slate-50/50"
          }`}>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mb-2 inline-block">
              1구간: 점증 구간
            </span>
            <h3 className="font-bold text-slate-800 text-sm mb-1">소득이 늘수록 지급액 증가</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              급여 수준이 낮아 일할수록 장려금이 비례하여 커지는 구간입니다.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            incomeSection === "flat" ? "border-emerald-500 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-slate-50/50"
          }`}>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md mb-2 inline-block">
              2구간: 평탄 구간
            </span>
            <h3 className="font-bold text-slate-800 text-sm mb-1">최대 장려금 전액 지급</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              가구별 최대 금액(단독 165만 / 홑벌이 285만 / 맞벌이 330만)을 지급받습니다.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            incomeSection === "decreasing" ? "border-emerald-500 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-slate-50/50"
          }`}>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mb-2 inline-block">
              3구간: 점감 구간
            </span>
            <h3 className="font-bold text-slate-800 text-sm mb-1">소득 상한까지 점차 감소</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              총소득 한도(단독 2.2천 / 홑벌이 3.2천 / 맞벌이 3.8천만)에 가까울수록 감소합니다.
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left text-slate-600 border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">가구 유형</th>
                <th className="px-4 py-3 font-bold">총소득 기준 요건</th>
                <th className="px-4 py-3 font-bold">최대 지급액</th>
                <th className="px-4 py-3 font-bold">평탄(최대지급) 소득구간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">단독 가구</td>
                <td className="px-4 py-3">2,200만원 미만</td>
                <td className="px-4 py-3 font-bold text-emerald-600">165만원</td>
                <td className="px-4 py-3">400만원 ~ 900만원</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">홑벌이 가구</td>
                <td className="px-4 py-3">3,200만원 미만</td>
                <td className="px-4 py-3 font-bold text-emerald-600">285만원</td>
                <td className="px-4 py-3">700만원 ~ 1,400만원</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">맞벌이 가구</td>
                <td className="px-4 py-3">3,800만원 미만</td>
                <td className="px-4 py-3 font-bold text-emerald-600">330만원</td>
                <td className="px-4 py-3">800만원 ~ 1,700만원</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ & Important Points */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">❓ 자주 묻는 질문 (FAQ)</h3>

          <div className="space-y-3">
            <details className="group border border-slate-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-slate-800 cursor-pointer">
                <span>Q1. 재산 요건에서 주택 담보 대출(부채)은 차감되나요?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                아쉽게도 국세청 근로장려금 재산 산정 시 대출금(부채)은 차감되지 않습니다. 주택, 토지, 건물, 자동차, 전세금, 금융자산의 시가표준액 합계가 기준(2억 4천만원 미만)이 됩니다.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-slate-800 cursor-pointer">
                <span>Q2. 반기신청과 정기신청 중 무엇이 유리한가요?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                근로소득만 있는 소득자는 9월(상반기) 및 3월(하반기) 반기신청을 통해 장려금을 빠르게 분할 지급받을 수 있습니다. 사업소득자나 종교인은 5월 정기신청만 가능합니다.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-slate-800 cursor-pointer">
                <span>Q3. 자녀장려금은 부양자녀 1인당 얼마까지 지급되나요?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                홑벌이 및 맞벌이 가구 중 총소득 7,000만원 미만 가구의 18세 미만 부양자녀 1인당 최대 100만원까지 지급됩니다. (재산 1.7억~2.4억 구간 시 50% 감액)
              </p>
            </details>
          </div>
        </div>
      </div>

      <AdSenseBanner dataAdSlot="1234567890" />
    </div>
  );
}
