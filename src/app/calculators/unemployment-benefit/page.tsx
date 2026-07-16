"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

export default function UnemploymentBenefitPage() {
  const [year, setYear] = useState("2026");
  const [birthDate, setBirthDate] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [joinDate, setJoinDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  
  // Daily scheduled work hours (1 to 8)
  const [workHours, setWorkHours] = useState(8);
  
  // Employment insurance period category
  // "under-1", "1-to-3", "3-to-5", "5-to-10", "over-10"
  const [insurancePeriod, setInsurancePeriod] = useState("1-to-3");
  const [manualInsurancePeriod, setManualInsurancePeriod] = useState(false);

  // Input Mode: "simple" or "detail"
  const [inputMode, setInputMode] = useState("simple");
  
  // Simple input salary
  const [avgMonthlySalaryStr, setAvgMonthlySalaryStr] = useState("3,500,000");

  // Detailed input salary (last 3 months)
  const [month1SalaryStr, setMonth1SalaryStr] = useState("");
  const [month2SalaryStr, setMonth2SalaryStr] = useState("");
  const [month3SalaryStr, setMonth3SalaryStr] = useState("");
  const [annualBonusStr, setAnnualBonusStr] = useState("0");
  const [annualLeavePayStr, setAnnualLeavePayStr] = useState("0");

  // Calculation Results
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [threeMonthDays, setThreeMonthDays] = useState(91);
  const [totalWage, setTotalWage] = useState(0);
  const [avgDailyWage, setAvgDailyWage] = useState(0);
  const [dailyBenefit, setDailyBenefit] = useState(0);
  const [benefitDays, setBenefitDays] = useState(150);
  const [totalBenefit, setTotalBenefit] = useState(0);
  const [isLowerBoundApplied, setIsLowerBoundApplied] = useState(false);
  const [isUpperBoundApplied, setIsUpperBoundApplied] = useState(false);
  const [hasInsuranceWarning, setHasInsuranceWarning] = useState(false);

  // Formatter functions
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

  const calculateDaysBetween = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calculate age at separation date (만 나이)
  const calculateKoreanAge = (birthDateStr: string, leaveDateStr: string) => {
    if (!birthDateStr || !leaveDateStr) return null;
    const birth = new Date(birthDateStr);
    const leave = new Date(leaveDateStr);
    let age = leave.getFullYear() - birth.getFullYear();
    const m = leave.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && leave.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Pre-fill insurance period and calculate total work days based on join/leave dates
  useEffect(() => {
    if (joinDate && leaveDate) {
      const days = calculateDaysBetween(joinDate, leaveDate);
      setTotalWorkDays(days);

      // Warning if work days < 180 days (which is the basic eligibility requirement)
      setHasInsuranceWarning(days < 180);

      // Automatically set the suggested insurance period if not manual
      if (!manualInsurancePeriod) {
        const years = days / 365;
        if (years < 1) {
          setInsurancePeriod("under-1");
        } else if (years < 3) {
          setInsurancePeriod("1-to-3");
        } else if (years < 5) {
          setInsurancePeriod("3-to-5");
        } else if (years < 10) {
          setInsurancePeriod("5-to-10");
        } else {
          setInsurancePeriod("over-10");
        }
      }
    } else {
      setTotalWorkDays(0);
      setHasInsuranceWarning(false);
    }
  }, [joinDate, leaveDate, manualInsurancePeriod]);

  // Update calculated age when birthDate or leaveDate changes
  useEffect(() => {
    if (birthDate && leaveDate) {
      setCalculatedAge(calculateKoreanAge(birthDate, leaveDate));
    } else {
      setCalculatedAge(null);
    }
  }, [birthDate, leaveDate]);

  const handleCalculate = () => {
    let calculatedKoreanAgeVal = 30; // default age (Under 50)
    if (birthDate && leaveDate) {
      const computedAge = calculateKoreanAge(birthDate, leaveDate);
      if (computedAge !== null) {
        if (computedAge < 0) {
          alert("생년월일은 퇴사일 이전이어야 합니다.");
          return;
        }
        calculatedKoreanAgeVal = computedAge;
      }
    } else if (leaveDate && !birthDate) {
      // Just assume default under 50
    }

    // Determine calendar days in the last 3 months
    let calendarDays = 91; // default
    if (leaveDate) {
      const leave = new Date(leaveDate);
      const threeMonthsAgo = new Date(leaveDate);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const diffTime = leave.getTime() - threeMonthsAgo.getTime();
      calendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    setThreeMonthDays(calendarDays);

    // Sum Salaries
    let wageSum = 0;
    if (inputMode === "simple") {
      const monthlyWage = avgMonthlySalaryStr ? parseInt(removeCommas(avgMonthlySalaryStr), 10) : 0;
      wageSum = monthlyWage * 3;
    } else {
      const m1 = month1SalaryStr ? parseInt(removeCommas(month1SalaryStr), 10) : 0;
      const m2 = month2SalaryStr ? parseInt(removeCommas(month2SalaryStr), 10) : 0;
      const m3 = month3SalaryStr ? parseInt(removeCommas(month3SalaryStr), 10) : 0;
      const annualBonus = annualBonusStr ? parseInt(removeCommas(annualBonusStr), 10) : 0;
      const annualLeavePay = annualLeavePayStr ? parseInt(removeCommas(annualLeavePayStr), 10) : 0;
      
      // Basic 3 months pay + 3/12 of bonus & leave pay
      const bonusAddition = Math.floor(annualBonus * (3 / 12));
      const leavePayAddition = Math.floor(annualLeavePay * (3 / 12));
      
      wageSum = m1 + m2 + m3 + bonusAddition + leavePayAddition;
    }

    if (wageSum === 0) {
      alert("급여 정보를 입력해주세요.");
      return;
    }

    setTotalWage(wageSum);

    // Average Daily Wage
    const computedAvgDailyWage = wageSum / calendarDays;
    setAvgDailyWage(computedAvgDailyWage);

    // 60% of average daily wage
    const rawDailyBenefit = computedAvgDailyWage * 0.6;

    // Rules for Year (2025 vs 2026)
    // 2026: Min wage = 10,320, Upper limit = 68,100
    // 2025: Min wage = 10,030, Upper limit = 66,000
    const is2026 = year === "2026";
    const minHourlyWage = is2026 ? 10320 : 10030;
    const upperBound = is2026 ? 68100 : 66000;
    
    // Lower bound: 80% of minimum hourly wage * workHours per day
    const lowerBound = minHourlyWage * 0.8 * workHours;

    let finalDailyBenefit = rawDailyBenefit;
    let appliedLower = false;
    let appliedUpper = false;

    if (finalDailyBenefit > upperBound) {
      finalDailyBenefit = upperBound;
      appliedUpper = true;
    } else if (finalDailyBenefit < lowerBound) {
      finalDailyBenefit = lowerBound;
      appliedLower = true;
    }

    setDailyBenefit(finalDailyBenefit);
    setIsLowerBoundApplied(appliedLower);
    setIsUpperBoundApplied(appliedUpper);

    // Calculate duration (days)
    // Age division: Under 50 (만 50세 미만) vs 50 and older & Disabled (만 50세 이상 및 장애인)
    const isOlderOrDisabled = calculatedKoreanAgeVal >= 50 || isDisabled;
    let days = 120; // default min

    if (isOlderOrDisabled) {
      switch (insurancePeriod) {
        case "under-1":
          days = 120;
          break;
        case "1-to-3":
          days = 180;
          break;
        case "3-to-5":
          days = 210;
          break;
        case "5-to-10":
          days = 240;
          break;
        case "over-10":
          days = 270;
          break;
      }
    } else {
      switch (insurancePeriod) {
        case "under-1":
          days = 120;
          break;
        case "1-to-3":
          days = 150;
          break;
        case "3-to-5":
          days = 180;
          break;
        case "5-to-10":
          days = 210;
          break;
        case "over-10":
          days = 240;
          break;
      }
    }

    setBenefitDays(days);
    setTotalBenefit(finalDailyBenefit * days);
    setIsCalculated(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">실업급여 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      {/* Dark Theme Premium Container */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden relative">
        {/* Subtle glow effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        </div>

        <div className="relative p-6 md:p-10 text-slate-200">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 text-2xl">
              💸
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              실업급여 모의계산기
            </h1>
            <p className="text-slate-300 text-sm font-medium">
              2026년 최신 요율 완벽 반영 및 연령·근무조건 맞춤형 모의 시뮬레이션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Input Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📋 정보 입력</h2>

              {/* 퇴사일 연도 기준 */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">퇴사 연도 기준</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setYear("2026")}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      year === "2026"
                        ? "bg-emerald-500/20 border-emerald-500 text-white"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    2026년 퇴사자 (최신)
                  </button>
                  <button
                    onClick={() => setYear("2025")}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      year === "2025"
                        ? "bg-emerald-500/20 border-emerald-500 text-white"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    2025년 퇴사자
                  </button>
                </div>
              </div>

              {/* 나이 및 장애 여부 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">생년월일 (선택)</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                  />
                  {calculatedAge !== null && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-bold">퇴사 시점 만 나이: {calculatedAge}세</p>
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors p-3.5 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDisabled}
                      onChange={(e) => setIsDisabled(e.target.checked)}
                      className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-600 bg-slate-800"
                    />
                    <span className="text-sm font-bold text-slate-200 select-none">장애인 여부</span>
                  </label>
                </div>
              </div>

              {/* 근무 기간 입력 (선택) */}
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">현 직장 근무 기간 (재직일 계산용)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">입사일</label>
                    <input
                      type="date"
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">퇴사일</label>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
                {joinDate && leaveDate && (
                  <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                    totalWorkDays < 180
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    총 근무기간: {formatNumber(totalWorkDays)}일 {totalWorkDays < 180 && "(180일 미만 경고)"}
                  </div>
                )}
              </div>

              {/* 고용보험 총 가입기간 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">고용보험 총 가입기간</label>
                  <button
                    onClick={() => setManualInsurancePeriod(true)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors font-bold underline"
                  >
                    직접 선택하기
                  </button>
                </div>
                <select
                  value={insurancePeriod}
                  onChange={(e) => {
                    setInsurancePeriod(e.target.value);
                    setManualInsurancePeriod(true);
                  }}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="under-1">1년 미만</option>
                  <option value="1-to-3">1년 이상 ~ 3년 미만</option>
                  <option value="3-to-5">3년 이상 ~ 5년 미만</option>
                  <option value="5-to-10">5년 이상 ~ 10년 미만</option>
                  <option value="over-10">10년 이상</option>
                </select>
                {joinDate && leaveDate && !manualInsurancePeriod && (
                  <p className="text-[10px] text-emerald-400/80 mt-1.5 font-bold">
                    💡 근무 기간을 기준으로 가입기간이 자동 계산되었습니다. 이전 직장 가입 이력이 있다면 더 높게 선택하세요.
                  </p>
                )}
              </div>

              {/* 1일 소정 근로시간 */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">1일 평균 근로시간</label>
                <select
                  value={workHours}
                  onChange={(e) => setWorkHours(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="8">8시간 (일반 근로자)</option>
                  <option value="7">7시간</option>
                  <option value="6">6시간</option>
                  <option value="5">5시간</option>
                  <option value="4">4시간</option>
                  <option value="3">3시간</option>
                  <option value="2">2시간</option>
                  <option value="1">1시간</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
                  ※ 2023년 12월 법 개정으로 초단시간 근로자는 4시간 간주 없이 실제 일한 시간만큼 비례 적용됩니다.
                </p>
              </div>

              {/* 급여 입력 방식 */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">급여 입력 방식</label>
                  <div className="flex gap-1.5 bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      onClick={() => setInputMode("simple")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        inputMode === "simple" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      간편 입력
                    </button>
                    <button
                      onClick={() => setInputMode("detail")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        inputMode === "detail" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      상세 입력
                    </button>
                  </div>
                </div>

                {inputMode === "simple" ? (
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">평균 세전 월급</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₩</span>
                      <input
                        type="text"
                        value={avgMonthlySalaryStr}
                        onChange={handleCurrencyChange(setAvgMonthlySalaryStr)}
                        placeholder="3,500,000"
                        className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 pl-10 pr-10 text-white font-bold outline-none focus:border-emerald-400 text-right transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">최근 3개월간 기본급 및 수당 총합</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={month1SalaryStr}
                            onChange={handleCurrencyChange(setMonth1SalaryStr)}
                            placeholder="1월급"
                            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2 text-xs text-white font-bold outline-none focus:border-emerald-400 text-right"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={month2SalaryStr}
                            onChange={handleCurrencyChange(setMonth2SalaryStr)}
                            placeholder="2월급"
                            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2 text-xs text-white font-bold outline-none focus:border-emerald-400 text-right"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={month3SalaryStr}
                            onChange={handleCurrencyChange(setMonth3SalaryStr)}
                            placeholder="3월급"
                            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2 text-xs text-white font-bold outline-none focus:border-emerald-400 text-right"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">연간 보너스(상여금)</label>
                        <input
                          type="text"
                          value={annualBonusStr}
                          onChange={handleCurrencyChange(setAnnualBonusStr)}
                          className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-emerald-400 text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">연차휴가 미사용수당</label>
                        <input
                          type="text"
                          value={annualLeavePayStr}
                          onChange={handleCurrencyChange(setAnnualLeavePayStr)}
                          className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-emerald-400 text-right"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleCalculate}
                className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
              >
                실업급여 모의계산 →
              </button>
            </div>

            {/* Result Section */}
            <div className={`space-y-6 transition-opacity duration-500 ${isCalculated ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📊 예상 결과</h2>

              {/* Total Benefit Card */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">총 예상 수급액 (세전)</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-medium text-emerald-400">₩</span>
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {formatNumber(totalBenefit)}
                  </span>
                </div>
                {hasInsuranceWarning && isCalculated && (
                  <p className="text-xs text-rose-400 mt-3 font-medium bg-rose-500/10 inline-block px-3 py-1 rounded-full border border-rose-500/20">
                    ⚠️ 피보험 단위기간 180일 미만으로 실업급여 수급 자격에 미달할 수 있습니다.
                  </p>
                )}
              </div>

              {/* Specific Items */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-300">1일 예상 구직급여액</span>
                  <div className="text-right">
                    <span className="text-white font-bold block text-base">₩{formatNumber(dailyBenefit)} / 일</span>
                    {isUpperBoundApplied && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-0.5 inline-block">상한액 적용 ({year}년 기준)</span>
                    )}
                    {isLowerBoundApplied && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5 inline-block font-bold">하한액 적용 (1일 {workHours}시간 기준)</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-medium border-t border-slate-700/50 pt-3">
                  <span className="text-slate-300">구직급여 수급기간</span>
                  <span className="text-emerald-400 font-extrabold text-lg">{benefitDays}일</span>
                </div>
              </div>

              {/* Calculation Details */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">계산 산출 상세 내역</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-300">이직 전 3개월 근무일수</span>
                    <span className="text-white font-bold">{threeMonthDays}일</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-300">3개월간 보수총액</span>
                    <span className="text-white font-bold">₩{formatNumber(totalWage)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-300">산출된 1일 평균임금</span>
                    <span className="text-white font-bold">₩{formatNumber(avgDailyWage)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium border-t border-slate-700/30 pt-2.5">
                    <span className="text-slate-300">1일 기초구직급여액 (평균임금의 60%)</span>
                    <span className="text-white font-bold">₩{formatNumber(avgDailyWage * 0.6)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs font-bold text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                공식: 1일 예상 구직급여액 × 수급기간(소정급여일수)
              </div>

              {/* Coupang Link */}
              <div className="mt-6 mb-4">
                <a href="https://link.coupang.com/a/d3Fm5zRXxs" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
                      <div>
                        <h3 className="text-lg font-black mb-0.5">내 자산을 지키는 재테크 책 추천</h3>
                        <p className="text-emerald-100 font-medium text-xs md:text-sm">성공적인 퇴사 후 커리어 설계와 경제적 자유 바이블</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-center bg-white text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm group-hover:bg-emerald-50 transition-colors">
                      도서 보기 🚀
                    </span>
                  </div>
                  <div className="absolute bottom-1 right-3 text-[9px] text-white/30">파트너스 활동 수수료 제공 가능</div>
                </a>
              </div>

              <ShareButtons
                title="2026년 실업급여 모의계산기"
                description={`내 예상 실업급여는 총 ₩${formatNumber(totalBenefit)} (일일 ₩${formatNumber(dailyBenefit)}, ${benefitDays}일 수급) 입니다!`}
                kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ & Guide */}
      <article className="max-w-none space-y-10 pb-12 mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">
            2026년 실업급여(구직급여) 최신 규정 및 완벽 가이드
          </h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide">
            실업급여는 근로자가 실직하여 재취업을 준비하는 기간 동안 소정의 구직급여를 지급함으로써 실업으로 인한 생계 불안을 극복하고, 새로운 일자리를 찾을 수 있도록 지원하는 고용보험 제도입니다. 
            특히 <strong>2026년 최저시급(10,320원)</strong> 적용 및 상한액 인상으로 인해 2026년 이후 퇴사자는 새로운 상·하한액 기준으로 수급액이 결정됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">
            실업급여 수급을 위한 필수 3대 요건
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">1</span>
                고용보험 피보험 단위기간 180일 이상
              </h3>
              <p className="text-slate-700 text-sm pl-7 leading-relaxed">
                퇴사 전 18개월(초단시간 근로자는 24개월) 동안 실제 근무하며 보수를 받은 일수가 통산하여 <strong>180일 이상</strong>이어야 합니다. 주말 중 유급휴일인 주휴일은 포함되지만, 무급휴일은 산정에서 제외됩니다.
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">2</span>
                비자발적인 퇴사 사유 (이직 사유)
              </h3>
              <p className="text-slate-700 text-sm pl-7 leading-relaxed">
                경영상 권고사직, 해고, 계약기간 만료, 회사 부도 및 이전 등 피치 못할 <strong>비자발적 이직</strong>이어야 합니다. 
                자발적 퇴사라 하더라도 2개월 이상의 임금체불, 직장 내 괴롭힘 또는 성희롱, 통근 곤란(왕복 3시간 이상 소요) 등이 입증될 경우 실업급여 수급이 예외적으로 가능합니다.
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">3</span>
                근로 의사와 적극적인 재취업 활동
              </h3>
              <p className="text-slate-700 text-sm pl-7 leading-relaxed">
                근로의 의사와 능력이 있음에도 불구하고 취업하지 못한 상태에서, 고용노동부 워크넷 등을 통해 성실하고 적극적인 구직 활동(이력서 제출, 면접 등)을 통해 복직 노력을 다하고 있어야 합니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">
            2026년 실업급여 하루 지급액 기준 (상한액 & 하한액)
          </h2>
          <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-bold text-slate-700">구분</th>
                <th className="p-3 font-bold text-slate-700">2025년 퇴사 기준</th>
                <th className="p-3 font-bold text-slate-700 text-emerald-600">2026년 퇴사 기준</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-semibold text-slate-800">1일 상한액</td>
                <td className="p-3 text-slate-600">66,000원</td>
                <td className="p-3 font-bold text-emerald-600">68,100원</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">1일 하한액 (8시간)</td>
                <td className="p-3 text-slate-600">64,192원 (최저시급 10,030원의 80%)</td>
                <td className="p-3 font-bold text-emerald-600">66,048원 (최저시급 10,320원의 80%)</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed pl-1">
            ※ 1일 하한액은 근로기준법상 1일 평균 소정근로시간에 비례하여 지급됩니다. 예를 들어, 하루 4시간을 근무했던 경우 2026년 기준 1일 하한액은 33,024원입니다. (4시간 간주 규정 폐지 반영)
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">
            자주 묻는 질문 (FAQ)
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 mb-2">
                <span className="text-emerald-500">Q.</span> 실업급여는 퇴사 후 언제까지 신청해야 하나요?
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed pl-7">
                실업급여는 퇴사한 다음 날부터 **12개월이 지나면** 소정 수급 일수가 남아 있더라도 남은 급여를 지급받을 수 없습니다. 따라서 가급적 퇴사 직후 지체 없이 관할 고용센터에 실업을 신고하고 구직급여를 신청해야 안전합니다.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 mb-2">
                <span className="text-emerald-500">Q.</span> 자발적으로 사표를 썼는데도 수급이 가능한 사유는 무엇인가요?
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed pl-7">
                법정 사유로는 대표적으로 **2개월 이상의 임금체불**, 최저임금 미달, 주 52시간 초과 근로가 발생한 경우입니다. 또한 부모의 간병이나 직장 주소지 이전으로 통근 시간이 왕복 3시간 이상으로 길어진 경우, 직장 내 괴롭힘 또는 성희롱이 발생한 경우 등 정당한 이직 사유가 입증되면 수급 자격이 인정될 수 있습니다.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 mb-2">
                <span className="text-emerald-500">Q.</span> 수급 중 유튜브 수익이 생기거나 파트타임 알바를 하면 안 되나요?
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed pl-7">
                실업급여 수급 기간 중 단기 알바를 하거나 소득(강의료, 원고료, 애드센스 등)이 발생하는 경우, 반드시 관할 고용노동청에 실업 신고 시 **해당 사실과 소득 내역을 성실히 신고(소득 발생 신고)**해야 합니다. 신고를 누락할 경우 부정 수급에 해당하여 엄격한 과태료 및 반환 처분을 받게 될 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            <WordPressLink
              title="2026년 실업급여(구직급여) 조건, 금액 및 지급일수 완벽 가이드"
              url={`https://weknews.com/?s=${encodeURIComponent('실업급여 조건')}`}
            />
            <WordPressLink
              title="실업급여 자발적 퇴사 시 예외적으로 수급받을 수 있는 13가지 사유"
              url={`https://weknews.com/?s=${encodeURIComponent('자발적 퇴사 실업급여')}`}
            />
          </div>
        </section>
      </article>
    </div>
  );
}
