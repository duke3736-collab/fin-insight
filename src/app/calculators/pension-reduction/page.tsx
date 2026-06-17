"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

// 연도별 A값 정의 (2024, 2025, 2026)
const A_VALUES: Record<number, number> = {
  2024: 298.9237, // 만 원 단위
  2025: 308.9062,
  2026: 319.3511
};

export default function PensionReductionCalculator() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  const [pensionAmt, setPensionAmt] = useState<number>(120);
  const [grossEarned, setGrossEarned] = useState<number>(450);
  const [grossBusiness, setGrossBusiness] = useState<number>(200);
  const [expenseRate, setExpenseRate] = useState<number>(60);
  const [pensionYears, setPensionYears] = useState<number>(1);
  const [excludedProperty, setExcludedProperty] = useState<number>(150);

  // 1. 근로소득공제 연산
  const earnedDeduction = useMemo(() => {
    const annualGross = grossEarned * 12 * 10000; // 원 단위 변환
    let annualDeduction = 0;
    
    if (annualGross <= 5000000) {
      annualDeduction = annualGross * 0.7;
    } else if (annualGross <= 15000000) {
      annualDeduction = 3500000 + (annualGross - 5000000) * 0.4;
    } else if (annualGross <= 45000000) {
      annualDeduction = 7500000 + (annualGross - 15000000) * 0.15;
    } else if (annualGross <= 100000000) {
      annualDeduction = 12000000 + (annualGross - 45000000) * 0.05;
    } else {
      annualDeduction = 14750000 + (annualGross - 100000000) * 0.02;
    }
    
    // 최대 2,000만 원 공제 한도 적용
    annualDeduction = Math.min(20000000, annualDeduction);

    const monthlyDeduction = annualDeduction / 12 / 10000; // 만 원 단위 복원
    return Math.round(monthlyDeduction * 100) / 100;
  }, [grossEarned]);

  const netEarned = useMemo(() => {
    return Math.max(0, Math.round((grossEarned - earnedDeduction) * 100) / 100);
  }, [grossEarned, earnedDeduction]);

  // 2. 사업소득 필요경비 연산
  const businessExpense = useMemo(() => {
    return Math.round((grossBusiness * (expenseRate / 100)) * 100) / 100;
  }, [grossBusiness, expenseRate]);

  const netBusiness = useMemo(() => {
    return Math.max(0, Math.round((grossBusiness - businessExpense) * 100) / 100);
  }, [grossBusiness, businessExpense]);

  // 3. 과세소득 총합산
  const totalTaxable = useMemo(() => {
    return Math.round((netEarned + netBusiness) * 100) / 100;
  }, [netEarned, netBusiness]);

  // 4. 구간별 누진 감액 계산식
  const calculateDeductionForExcess = (excess: number, isNewLaw: boolean) => {
    if (excess <= 0) return 0;
    
    if (isNewLaw) {
      if (excess <= 200) {
        return 0;
      } else if (excess <= 300) {
        return 15 + (excess - 200) * 0.15;
      } else if (excess <= 400) {
        return 30 + (excess - 300) * 0.20;
      } else {
        return 50 + (excess - 400) * 0.25;
      }
    } else {
      if (excess <= 100) {
        return excess * 0.05;
      } else if (excess <= 200) {
        return 5 + (excess - 100) * 0.10;
      } else if (excess <= 300) {
        return 15 + (excess - 200) * 0.15;
      } else if (excess <= 400) {
        return 30 + (excess - 300) * 0.20;
      } else {
        return 50 + (excess - 400) * 0.25;
      }
    }
  };

  // 5. 핵심 계산 결과 취합
  const results = useMemo(() => {
    const A_VAL = A_VALUES[selectedYear];
    const isNewLaw = selectedYear >= 2025;
    const threshold = isNewLaw ? (A_VAL + 200) : A_VAL;
    const pensionCap = pensionAmt * 0.5;

    let finalDeduction = 0;
    let oldDeduction = 0;
    let savings = 0;
    
    const excessForCalculation = Math.max(0, totalTaxable - A_VAL);

    if (pensionYears > 5) {
      finalDeduction = 0;
      oldDeduction = Math.min(pensionCap, calculateDeductionForExcess(excessForCalculation, false));
      savings = oldDeduction;
    } else {
      const rawNew = calculateDeductionForExcess(excessForCalculation, isNewLaw);
      finalDeduction = Math.min(pensionCap, rawNew);
      
      const rawOld = calculateDeductionForExcess(excessForCalculation, false);
      oldDeduction = Math.min(pensionCap, rawOld);

      savings = Math.max(0, oldDeduction - finalDeduction);
    }

    const finalPension = Math.max(0, pensionAmt - finalDeduction);
    const excessToShow = Math.max(0, totalTaxable - threshold);

    return {
      A_VAL,
      threshold,
      pensionCap,
      finalDeduction,
      oldDeduction,
      savings,
      finalPension,
      excessToShow,
      rawDeductionVal: calculateDeductionForExcess(excessForCalculation, isNewLaw)
    };
  }, [selectedYear, pensionAmt, totalTaxable, pensionYears]);

  // 6. 감액 진단 상태 정보
  const diagnostic = useMemo(() => {
    if (pensionYears > 5) {
      return { text: "영구 면제 (안전)", style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" };
    } else if (results.finalDeduction === 0) {
      return { text: "감액 없음 (안전)", style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" };
    } else if (results.finalDeduction >= results.pensionCap) {
      return { text: "최대 감액 (경고)", style: "bg-rose-500/15 text-rose-400 border border-rose-500/25" };
    } else {
      return { text: "일부 감액 발생", style: "bg-amber-500/15 text-amber-400 border border-amber-500/25" };
    }
  }, [pensionYears, results]);

  // 7. 구간별 시각화 퍼센트 계산
  const progressWidths = useMemo(() => {
    const excess = results.excessToShow;
    const widths = { w1: "0%", w2: "0%", w3: "0%", w4: "0%", w5: "0%" };
    if (excess <= 0) return widths;

    if (excess <= 100) {
      widths.w1 = `${(excess / 100) * 100}%`;
    } else {
      widths.w1 = "100%";
      if (excess <= 200) {
        widths.w2 = `${((excess - 100) / 100) * 100}%`;
      } else {
        widths.w2 = "100%";
        if (excess <= 300) {
          widths.w3 = `${((excess - 200) / 100) * 100}%`;
        } else {
          widths.w3 = "100%";
          if (excess <= 400) {
            widths.w4 = `${((excess - 300) / 100) * 100}%`;
          } else {
            widths.w4 = "100%";
            widths.w5 = `${Math.min(100, ((excess - 400) / 200)) * 100}%`;
          }
        }
      }
    }
    return widths;
  }, [results.excessToShow]);

  // 8. AI 리포트 리포트 본문
  const aiReportText = useMemo(() => {
    let text = `📊 [${selectedYear}년 분석] 국민연금 감액 진단 분석 보고서\n\n`;

    if (pensionYears > 5) {
      text += `📢 [수급 연차안내] 연금 수령 개시일로부터 5년(60개월)이 지나 연금 감액 규정에서 영구 면제된 안전 구역입니다.\n`;
      text += `- 현재 근로소득 및 사업소득을 아무리 많이 창출하셔도 매달 원래 연금 ${pensionAmt}만 원이 전액 100% 온전히 지급됩니다.\n`;
      text += `- 과거 기준법에 의했다면 매년 약 ${(results.savings * 12).toFixed(1)}만 원의 삭감이 발생했을 상황이나, 5년 경과 규정에 의해 한 푼도 삭감되지 않습니다.\n\n`;
      text += `💡 [솔루션] 감액에 대한 불안 없이 은퇴 후 적극적인 경제 활동 및 현금 흐름 투자를 이어가시길 권장합니다.`;
      return text;
    }

    text += `📢 [소득 구조 분석]\n`;
    text += `- 과세 대상 월 소득금액은 총 ${totalTaxable.toFixed(1)}만 원 (근로소득금액 ${netEarned}만 원 + 사업소득금액 ${netBusiness}만 원) 입니다.\n`;
    text += `- 현재 선택하신 ${selectedYear}년 감액 기준선인 ${results.threshold.toFixed(2)}만 원과 대조 결과, `;

    if (totalTaxable <= results.threshold) {
      text += `기준선 이하이므로 연금 삭감 없이 100% 전액 수령하십니다. 🎉\n\n`;
      if (results.savings > 0) {
        if (selectedYear === 2025) {
          text += `🔥 [개정안 수급 효과] 과거 기존법(308.9만 원 초과 시 감액)을 적용했을 경우 월 ${results.savings.toFixed(1)}만 원이 깎였을 뻔했으나, 소급 적용 상향선 덕분에 전액 복구되었습니다. 2026년 7월 말 자동으로 약 ${(results.savings * 12).toFixed(0)}만 원이 환급 예정입니다!\n\n`;
        } else {
          text += `🔥 [개정안 절세 효과] 기존 감액 기준(319.3만 원 초과 시 감액) 하에서는 월 약 ${results.savings.toFixed(1)}만 원이 삭감될 소득이었으나, 기준선 상향 덕분에 삭감을 완전히 면제받아 매년 약 ${(results.savings * 12).toFixed(0)}만 원의 연금을 추가로 지켜냈습니다.\n\n`;
        }
      }
      text += `💡 [은퇴 관리 솔루션]\n`;
      text += `1) 소득 한도선 유지: 과세 대상 소득금액 합계가 ${results.threshold.toFixed(1)}만 원 이하로 관리될 수 있도록 소득 구조를 조율하는 것이 베스트입니다.\n`;
      text += `2) 제외 소득 활용: 사적연금, 배당금, 이자소득, 퇴직연금은 이 감액 기준 계산에 절대 합산되지 않으므로, 이를 활용한 추가 은퇴 소득 파이프라인을 구축하세요.`;
    } else {
      const excess = totalTaxable - results.threshold;
      text += `기준선을 ${excess.toFixed(1)}만 원 초과하여 매월 ${results.finalDeduction.toFixed(1)}만 원의 감액이 적용됩니다. ⚠️\n\n`;
      
      if (results.savings > 0) {
        text += `🔥 [개정안 절세 효과] 개정된 완화법 덕분에 기존 법을 적용했을 때보다 매월 ${results.savings.toFixed(1)}만 원(연간 ${(results.savings * 12).toFixed(0)}만 원)의 노령연금을 지키는 이득을 보고 계싱니다.\n\n`;
      }

      text += `🛡️ [소득 방어 및 삭감 최소화 전략]\n`;
      if (netBusiness > 0) {
        text += `1) 사업 필요경비 최적화: 현재 사업필요경비율이 ${expenseRate}%로 설정되어 소득금액이 계산되었습니다. 장부 기장 및 영수증 증빙을 통해 필요경비를 더욱 꼼꼼히 챙겨 과세 소득금액을 낮추면 감액을 크게 줄일 수 있습니다.\n`;
      }
      if (grossEarned > 500) {
        text += `2) 근로 시간 및 급여 세무 조율: 세전 근로소득 비율이 높을 경우, 근로 계약 조건을 조율하여 총급여를 한도선 부근으로 세무 설계하는 편이 연금 실수령액 관점에서 유리할 수 있습니다.\n`;
      }
      text += `3) 연기연금 제도 활용: 소득활동이 활발하여 감액이 크게 발생하는 5년 동안 연금 수령을 연기하면, 1년당 7.2%(최대 36%)의 이자가 가산되어 나중에 훨씬 큰 연금을 수령하실 수 있습니다.`;
    }

    return text;
  }, [selectedYear, pensionAmt, totalTaxable, netEarned, netBusiness, expenseRate, pensionYears, results]);

  const changePension = (val: number) => {
    setPensionAmt((prev) => Math.max(0, prev + val));
  };

  const handleNumericInput = (setter: React.Dispatch<React.SetStateAction<number>>, max = 10000) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setter(val ? Math.min(max, parseInt(val, 10)) : 0);
  };

  const formatNum = (num: number) => Math.round(num * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-slate-100">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-200">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-400">국민연금 감액기준 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Premium Dark Glass Dashboard Container */}
      <div className="bg-[#111827]/75 backdrop-blur-2xl border border-white/8 rounded-[2rem] shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-950/90 border-b border-white/8 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-900 via-blue-700 to-amber-500 p-2.5 rounded-xl text-white shadow-lg shrink-0">
              <i className="fa-solid fa-calculator text-xl"></i>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight flex items-center gap-2">
                국민연금 감액기준 및 실수령액 계산기
                <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">2026 개정 적용</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                2026년 6월 17일 시행 최신 감액기준 완화법 완벽 반영
              </p>
            </div>
          </div>
        </div>

        {/* Inputs & Results Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: 소득 정보 입력 */}
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
              <h2 className="text-xs font-black text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                <i className="fa-solid fa-sliders"></i> 소득 및 수급자 상태 입력
              </h2>
              <span className="text-[9px] text-slate-450 font-bold uppercase">1단계</span>
            </div>

            {/* 연도 선택 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-350">대상 연도</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
                {[2026, 2025, 2024].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedYear === year
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {year}년{year === 2025 ? "(소급)" : year === 2024 ? "(기존)" : ""}
                  </button>
                ))}
              </div>
              <p className={`text-[10px] font-semibold ${
                selectedYear === 2026 ? "text-blue-400" : selectedYear === 2025 ? "text-teal-400" : "text-slate-450"
              }`}>
                {selectedYear === 2026 && `💡 2026년 감액 기준선: 월 ${formatNum(A_VALUES[2026] + 200)}만 원 (A값+200만)`}
                {selectedYear === 2025 && `💡 2025년 감액 기준선(소급): 월 ${formatNum(A_VALUES[2025] + 200)}만 원 (A값+200만)`}
                {selectedYear === 2024 && `💡 2024년 감액 기준선(기존): 월 ${formatNum(A_VALUES[2024])}만 원 (A값 초과 시 즉시 감액)`}
              </p>
            </div>

            {/* 원래 기본 노령연금액 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">원래 수령 예정이던 노령연금액 (월 / 만 원)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pensionAmt === 0 ? "" : pensionAmt.toLocaleString("ko-KR")}
                  onChange={handleNumericInput(setPensionAmt, 500)}
                  placeholder="예: 120"
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-sm font-extrabold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
                />
                <span className="text-xs text-slate-400 font-bold w-10 shrink-0">만 원</span>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => changePension(10)} className="bg-slate-850 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-300 transition-colors">+10만</button>
                <button type="button" onClick={() => changePension(50)} className="bg-slate-850 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-300 transition-colors">+50만</button>
                <button type="button" onClick={() => changePension(100)} className="bg-slate-850 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-300 transition-colors">+100만</button>
                <button type="button" onClick={() => setPensionAmt(120)} className="bg-slate-850/50 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-400 transition-colors">초기화</button>
              </div>
            </div>

            {/* 세전 근로소득 */}
            <div className="space-y-2 border-t border-slate-800/50 pt-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-300">월 세전 근로소득 (월급 / 만 원)</label>
                <span className="text-[9px] text-amber-400 font-bold">근로소득공제 적용 전</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={grossEarned === 0 ? "" : grossEarned.toLocaleString("ko-KR")}
                  onChange={handleNumericInput(setGrossEarned, 3000)}
                  placeholder="예: 450"
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-sm font-extrabold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
                />
                <span className="text-xs text-slate-400 font-bold w-10 shrink-0">만 원</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1 text-[9.5px]">
                <div className="flex justify-between text-slate-400">
                  <span>월 근로소득공제액:</span>
                  <span className="text-red-400 font-bold">- {earnedDeduction.toLocaleString()} 만원</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-white/5 pt-1 mt-1 font-bold">
                  <span>과세대상 근로소득금액:</span>
                  <span className="text-emerald-400">{netEarned.toLocaleString()} 만원</span>
                </div>
              </div>
            </div>

            {/* 사업/임대소득 */}
            <div className="space-y-2 border-t border-slate-800/50 pt-3">
              <label className="block text-xs font-bold text-slate-300">월 사업소득 (월 매출 / 만 원)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={grossBusiness === 0 ? "" : grossBusiness.toLocaleString("ko-KR")}
                  onChange={handleNumericInput(setGrossBusiness, 3000)}
                  placeholder="예: 200"
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-sm font-extrabold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-right"
                />
                <span className="text-xs text-slate-400 font-bold w-10 shrink-0">만 원</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>필요경비율 설정:</span>
                  <span className="text-amber-400 font-bold">{expenseRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={expenseRate}
                  onChange={(e) => setExpenseRate(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1 text-[9.5px]">
                <div className="flex justify-between text-slate-400">
                  <span>필요경비 차감액:</span>
                  <span className="text-red-400 font-bold">- {businessExpense.toLocaleString()} 만원</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-white/5 pt-1 mt-1 font-bold">
                  <span>과세대상 사업소득금액:</span>
                  <span className="text-emerald-400">{netBusiness.toLocaleString()} 만원</span>
                </div>
              </div>
            </div>

            {/* 수령연차 */}
            <div className="space-y-2 border-t border-slate-800/50 pt-3">
              <label className="block text-xs font-bold text-slate-300">연금 수령 연차</label>
              <select
                value={pensionYears}
                onChange={(e) => setPensionYears(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1년차 (수령 시작 후 12개월 이하)</option>
                <option value={2}>2년차 (13개월 ~ 24개월)</option>
                <option value={3}>3년차 (25개월 ~ 36개월)</option>
                <option value={4}>4년차 (37개월 ~ 48개월)</option>
                <option value={5}>5년차 (49개월 ~ 60개월)</option>
                <option value={6}>5년 초과 (수령 6년차부터 무조건 감액 제외)</option>
              </select>
            </div>

          </div>

          {/* Right Column: 진단 결과 디스플레이 */}
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
              <h2 className="text-xs font-black text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
                <i className="fa-solid fa-square-poll-vertical"></i> 실시간 감액 진단 결과
              </h2>
              <span className={`wp-pension-calc-badge ${diagnostic.style}`}>
                {diagnostic.text}
              </span>
            </div>

            {/* 결과 판넬 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-4 rounded-2xl space-y-0.5 relative overflow-hidden">
                <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest block">최종 월 연금 실수령액</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-black text-blue-400">{results.finalPension.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400">만 원</span>
                </div>
                <p className="text-[9px] text-slate-500">감액 전 원래 연금액: {pensionAmt.toLocaleString()}만 원</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-4 rounded-2xl space-y-0.5 relative overflow-hidden">
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                  {selectedYear === 2025 ? "2025 소급 환급 예상액" : "개정법 절세 효과 (월)"}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-black text-emerald-400">{results.savings.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400">만 원</span>
                </div>
                <p className="text-[9px] text-slate-450">
                  {selectedYear === 2024 ? "해당 없음" : `매년 약 ${formatNum(results.savings * 12).toLocaleString()}만 원 보전`}
                </p>
              </div>
            </div>

            {/* 삭감 요약 바 */}
            <div className="flex justify-between items-center bg-slate-950/60 border border-white/5 p-3.5 rounded-xl text-xs">
              <span className="text-slate-400">월 감액(삭감) 금액:</span>
              <span className="font-extrabold text-red-400">{results.finalDeduction.toLocaleString()} 만 원</span>
            </div>

            {/* 감액 구간 분포도 */}
            <div className="space-y-3 pt-2 border-t border-slate-800/40">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-350">초과소득 감액 구간 분포도</span>
                <span className="text-[10px] text-slate-400">과세 소득금액: <strong className="text-white font-extrabold">{totalTaxable.toLocaleString()}만 원</strong></span>
              </div>
              
              <div className="h-6 w-full bg-white/3 border border-white/5 rounded-lg relative overflow-hidden flex">
                <div className="h-full bg-blue-500/30 transition-all duration-300" style={{ width: progressWidths.w1 }}></div>
                <div className="h-full bg-blue-600/40 transition-all duration-300" style={{ width: progressWidths.w2 }}></div>
                <div className="h-full bg-amber-500/30 transition-all duration-300" style={{ width: progressWidths.w3 }}></div>
                <div className="h-full bg-amber-600/40 transition-all duration-300" style={{ width: progressWidths.w4 }}></div>
                <div className="h-full bg-red-500/30 transition-all duration-300" style={{ width: progressWidths.w5 }}></div>

                {/* Markers */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/25 z-10" style={{ left: "20%" }}><span className="absolute top-[-16px] text-[8px] text-slate-400 translate-x-[-50%]">100만</span></div>
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/25 z-10" style={{ left: "40%" }}><span className="absolute top-[-16px] text-[8px] text-slate-400 translate-x-[-50%]">200만</span></div>
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/25 z-10" style={{ left: "60%" }}><span className="absolute top-[-16px] text-[8px] text-slate-400 translate-x-[-50%]">300만</span></div>
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/25 z-10" style={{ left: "80%" }}><span className="absolute top-[-16px] text-[8px] text-slate-400 translate-x-[-50%]">400만</span></div>
              </div>
              
              <div className="flex justify-between items-center text-[9px] text-slate-500">
                <span>A기준선 (0%)</span>
                <span>1구간 (5%)</span>
                <span>2구간 (10%)</span>
                <span>3구간 (15%)</span>
                <span>4구간 (20%)</span>
                <span>5구간 (25%)</span>
              </div>
            </div>

            {/* 법정 산식 상세 계산 내역 */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-350">🔍 법정 산식 상세 계산 내역</h3>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-xs space-y-2 leading-relaxed text-slate-400">
                <div className="flex justify-between">
                  <span>1. 과세대상 총 소득월액 (근로+사업)</span>
                  <span className="font-bold text-white">{totalTaxable.toLocaleString()} 만원</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>2. 국민연금 감액 면제 기준선 (A값)</span>
                  <span className="font-bold text-blue-400">{formatNum(results.threshold)} 만원</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>3. 기준 초과 소득월액 (1번 - 2번)</span>
                  <span className="font-bold text-white">{formatNum(results.excessToShow)} 만원</span>
                </div>
                <div className="flex justify-between">
                  <span>4. 구간별 누진 감액액</span>
                  <span className="font-bold text-white">{formatNum(results.rawDeductionVal)} 만원</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>5. 50% 감액 한도 캡 (연금의 50% 제한)</span>
                  <span className="font-bold text-amber-500">{results.pensionCap.toLocaleString()} 만원</span>
                </div>
                <div className="flex justify-between pt-1 text-slate-200 font-extrabold">
                  <span>최종 차감 삭감액 (4번과 5번 중 최소값)</span>
                  <span className="text-red-400">{results.finalDeduction.toLocaleString()} 만원</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* AI 솔루션 리포트 */}
        <div className="p-6 md:p-8 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI 노후 자산 설계 및 절세 솔루션 리포트
          </h3>
          <div className="bg-slate-950 border border-white/5 p-4 rounded-xl text-xs text-blue-300 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
            {aiReportText}
          </div>
        </div>

        {/* 공유 버튼 */}
        <div className="p-6 border-t border-slate-800">
          <ShareButtons
            title="국민연금 감액기준 계산기 (2026 최신 개정)"
            description="소득활동으로 인해 깎이는 국민연금을 개정법 기준으로 계산해보고 2025년 환급금도 확인해보세요!"
            kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01"
          />
        </div>

      </div>

      {/* 안내 아티클 */}
      <article className="bg-[#111827]/60 p-8 md:p-10 rounded-2xl border border-white/5 shadow-sm mt-12 space-y-8">
        <section className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-4">국민연금 소득 활동 감액 제도란 무엇인가요?</h2>
          <p className="mb-4">
            노령연금 수급자가 연금을 받는 도중에 <strong>일정 수준 이상의 소득 활동</strong>을 하는 경우, 수급 시작일로부터 5년 동안 연금액의 일부를 감액하여 지급하는 제도입니다. 
            고령화 시대에 노후 경제 활동을 장려하기 위해 2026년 6월 17일부터 감액 기준이 대폭 완화되었습니다.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">1. 2026년 6월 17일 시행 개정법의 핵심</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>기준선의 상향:</strong> 기존에는 전체 가입자의 평균 소득액인 <strong>'A값(2026년 기준 3,193,511원)'</strong>만 초과해도 감액되었으나, 이제는 <strong>'A값 + 200만 원(5,193,511원)'</strong>을 초과해야 감액이 시작됩니다.</li>
            <li><strong>저소득 구간 폐지:</strong> 기존 5단계 중 소득이 낮은 1, 2구간이 완전히 폐지되어, 월 소득 약 519만 원 미만의 근로/사업 소득자는 단 1원도 깎이지 않고 국민연금을 100% 전액 수령합니다.</li>
            <li><strong>2025년 소급 적용:</strong> 이번 개정법은 2025년 소득분부터 소급 적용됩니다. 따라서 2025년 월 소득이 5,089,062원 미만인데 이미 연금이 깎였던 수급자는 <strong>2026년 7월 말</strong>부터 별도의 신청 없이 자동으로 환급을 받게 됩니다.</li>
          </ul>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">2. 감액 대상이 되는 '소득'의 정확한 정의</h3>
          <p className="mb-4">
            감액의 기준이 되는 소득은 <strong>'근로소득금액'</strong>과 <strong>'사업소득금액(부동산 임대소득 포함)'</strong>입니다.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mb-6">
            <li><strong>근로소득금액:</strong> 총급여액(세전 세무서 신고액)에서 국세청 기준의 '근로소득공제'를 차감한 순소득금액입니다.</li>
            <li><strong>사업소득금액:</strong> 총매출액(수입)에서 실제로 사용된 '필요경비'를 제한 소득금액입니다.</li>
            <li><strong>합산 제외 소득 (감액에 영향 없음):</strong> 이자소득, 배당소득, 국민연금/사적연금 수령액, 퇴직연금, 기타소득은 국민연금 감액 기준에 전혀 합산되지 않습니다.</li>
          </ul>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">3. 감액 기간과 한도</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>최대 5년 제한:</strong> 소득이 아무리 많아도 감액은 노령연금 수급 개시일로부터 <strong>최대 5년 동안만</strong> 적용됩니다. 5년이 지난 이후에는 소득에 상관없이 전액을 다 받게 됩니다.</li>
            <li><strong>50% 한도:</strong> 감액 산식에 의해 계산된 감액 금액이 아무리 많아도, 본인이 원래 받는 노령연금액의 <strong>최대 50%를 초과하여 감액할 수 없습니다.</strong></li>
          </ul>
        </section>

        <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/5">
          <WordPressLink title="건강보험료 계산기로 직장/지역 건강보험료 모의 계산" url="/calculators/health-insurance" />
          <WordPressLink title="2026년 연봉 실수령액 계산기로 4대보험 공제 비율 확인" url="/calculators/salary" />
          <WordPressLink title="알바 급여 계산기로 주휴수당 포함 월 실수령액 계산" url="/calculators/part-time-salary" />
        </div>
      </article>
    </div>
  );
}
