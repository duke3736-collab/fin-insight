"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

export default function WeeklyAllowanceCalculatorPage() {
  // Inputs
  const [hourlyWageStr, setHourlyWageStr] = useState("10,030"); // 최저시급 기준
  const [weeklyHours, setWeeklyHours] = useState<number>(40); // 주 40시간 기본
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [useCustomWeeklyHours, setUseCustomWeeklyHours] = useState<boolean>(false);
  const [customWeeklyHours, setCustomWeeklyHours] = useState<number>(40);
  const [isAttended, setIsAttended] = useState<boolean>(true); // 개근 여부

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setHourlyWageStr(formatNumber(Math.min(num, 1000000))); // 100만 원 제한
  };

  const setMinimumWage = () => setHourlyWageStr(formatNumber(10030)); // 최저시급

  // 실제 계산에 사용되는 주간 총 근로시간
  const actualWeeklyHours = useMemo(() => {
    if (useCustomWeeklyHours) {
      return customWeeklyHours;
    }
    return daysPerWeek * hoursPerDay;
  }, [useCustomWeeklyHours, customWeeklyHours, daysPerWeek, hoursPerDay]);

  // 주휴수당 계산 결과
  const result = useMemo(() => {
    const wage = parseInputNumber(hourlyWageStr);
    const isEligible = actualWeeklyHours >= 15 && isAttended;

    let weeklyHolidayHours = 0;
    if (isEligible) {
      if (actualWeeklyHours >= 40) {
        weeklyHolidayHours = 8;
      } else {
        weeklyHolidayHours = actualWeeklyHours * 0.2; // (주 근로시간 / 40) * 8
      }
    }

    const weeklyAllowance = Math.floor(weeklyHolidayHours * wage); // 주휴수당
    const weeklyWorkPay = Math.floor(actualWeeklyHours * wage); // 기본 근로수당
    const totalWeeklyPay = weeklyWorkPay + weeklyAllowance; // 총 주급

    // 월 평균 주수 4.345주 적용
    const monthlyAllowance = Math.floor(weeklyAllowance * 4.345);
    const totalMonthlyPay = Math.floor(totalWeeklyPay * 4.345);

    // 주휴수당 포함 실효 시급
    const effectiveHourlyRate = actualWeeklyHours > 0 ? Math.floor(totalWeeklyPay / actualWeeklyHours) : 0;

    return {
      wage,
      actualWeeklyHours,
      isEligible,
      weeklyHolidayHours,
      weeklyAllowance,
      weeklyWorkPay,
      totalWeeklyPay,
      monthlyAllowance,
      totalMonthlyPay,
      effectiveHourlyRate,
    };
  }, [hourlyWageStr, actualWeeklyHours, isAttended]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 mb-3">
            최저임금 및 근로기준법 제55조 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            ⏱️ 주휴수당 자동 계산기
          </h1>
          <p className="text-teal-100 text-sm md:text-base max-w-2xl leading-relaxed">
            시급과 주간 근로시간을 입력하시면 <strong>주휴시간</strong>, <strong>예상 주휴수당</strong>, 
            <strong>주급·월급 총액</strong> 및 <strong>주휴수당 포함 실효시급</strong>을 즉시 산출해 드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 시급 입력 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  약정 시급 (원)
                </label>
                <button
                  onClick={setMinimumWage}
                  className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  2026 최저시급 적용 (10,030원)
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={hourlyWageStr}
                  onChange={handleWageChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
            </div>

            {/* 2. 근로 시간 설정 */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  주간 근로시간 입력 방식
                </label>
                <button
                  onClick={() => setUseCustomWeeklyHours(!useCustomWeeklyHours)}
                  className="text-xs text-teal-600 font-bold underline"
                >
                  {useCustomWeeklyHours ? "주 며칠/몇 시간으로 설정" : "주간 총 시간 직접 입력"}
                </button>
              </div>

              {!useCustomWeeklyHours ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      주당 근무 일수
                    </label>
                    <select
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-teal-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          주 {d}일 근무
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      하루 근로 시간
                    </label>
                    <select
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-teal-500"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((h) => (
                        <option key={h} value={h}>
                          하루 {h}시간
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    주간 총 소정근로시간 (시간)
                  </label>
                  <input
                    type="number"
                    value={customWeeklyHours}
                    onChange={(e) => setCustomWeeklyHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-right focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 font-bold flex justify-between items-center">
                <span>주간 총 근로시간:</span>
                <span className="text-sm font-black text-teal-700">{actualWeeklyHours} 시간 / 주</span>
              </div>
            </div>

            {/* 3. 개근 여부 */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                주간 약정 소정근로일 개근 여부
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIsAttended(true)}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition-all ${
                    isAttended
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  ✅ 전일 개근함 (주휴수당 발생)
                </button>
                <button
                  onClick={() => setIsAttended(false)}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition-all ${
                    !isAttended
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  ❌ 무단 결근 발생 (주휴수당 미발생)
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                * 지각이나 조퇴는 결근이 아니므로 주휴수당 지급 조건에 영향을 주지 않습니다.
              </p>
            </div>

          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 주휴수당 계산 결과</span>
              </h2>
              <span
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md ${
                  result.isEligible
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {result.isEligible ? "주휴수당 지급 대상" : "지급 대상 제외"}
              </span>
            </div>

            {/* Main Allowance Display */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-6 text-white space-y-2 relative overflow-hidden">
              <span className="text-xs text-teal-200 font-bold block">
                주간 예상 주휴수당 ({result.weeklyHolidayHours.toFixed(1)}시간분)
              </span>
              <div className="text-3xl md:text-4xl font-black text-teal-300 tracking-tight">
                {formatNumber(result.weeklyAllowance)}
                <span className="text-xl font-normal text-white ml-1">원 / 주</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold pt-1">
                월간 환산 주휴수당: 약 {formatNumber(result.monthlyAllowance)} 원/월
              </p>
            </div>

            {/* Total Pay Summary */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>기본 근로수당 (주 {result.actualWeeklyHours}시간)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.weeklyWorkPay)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>주휴수당 (주 {result.weeklyHolidayHours.toFixed(1)}시간)</span>
                <span className="font-bold text-teal-600">+{formatNumber(result.weeklyAllowance)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 border-t border-slate-100 pt-2 font-black text-sm">
                <span>예상 주급 총액</span>
                <span className="text-teal-700">{formatNumber(result.totalWeeklyPay)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-black text-sm">
                <span>예상 월급 총액 (4.345주)</span>
                <span className="text-teal-700">{formatNumber(result.totalMonthlyPay)} 원</span>
              </div>
            </div>

            {/* Effective Hourly Rate Box */}
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-teal-900 block">
                💡 주휴수당 포함 실효 시급
              </span>
              <div className="text-xl font-black text-teal-800">
                {formatNumber(result.effectiveHourlyRate)} 원 / 시간
              </div>
              <p className="text-[11px] text-teal-700">
                약정 시급 {formatNumber(result.wage)}원 대비 약 20% 인상 효과
              </p>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 주휴수당 자동 계산기 - FinInsight"
                description={`내 주휴수당: 주당 ${formatNumber(result.weeklyAllowance)}원! 주급 ${formatNumber(result.totalWeeklyPay)}원, 월급 ${formatNumber(result.totalMonthlyPay)}원 확인하기.`}
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
            📖 주휴수당 발생 조건 및 완벽 계산법
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            근로기준법 제55조에 따라 사용자는 1주 동안 규정된 소정근로일을 개근한 근로자에게 1주일에 평균 1회 이상의 유급휴일(주휴일)을 주어야 합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                📌 주 15시간 이상 근로 조건
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                4주간을 평균하여 1주 소정근로시간이 15시간 이상이어야 발생합니다. 주 15시간 미만 초단시간 근로자는 법적으로 주휴수당 대상에서 제외됩니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                📐 단시간 근로자 비례 계산 공식
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                주 15시간 이상 40시간 미만 단시간 근로자의 주휴시간은 <strong>(주간 소정근로시간 ÷ 40시간) × 8시간</strong>으로 비례 계산됩니다.
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
                <span>Q. 주중에 지각이나 조퇴를 한 경우에도 주휴수당을 받을 수 있나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                네, 지각이나 조퇴는 결근이 아니므로 약정한 근무일에 출근하여 근로를 제공했다면 개근으로 인정되어 주휴수당이 정상 지급됩니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 퇴사하는 마지막 주에도 주휴수당이 발생하나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                대법원 판례 및 고용노동부 행정해석 개정에 따라, 1주일간의 소정근로를 개근했다면 다음 주 근로가 예정되어 있지 않더라도 해당 주의 주휴수당은 발생합니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 급여 및 생활 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/salary"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              💸 연봉 실수령액 계산기
            </Link>
            <Link
              href="/calculators/part-time-salary"
              className="px-3 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors"
            >
              ⏰ 알바 급여 계산기
            </Link>
            <Link
              href="/calculators/unemployment-benefit"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              💸 실업급여 모의계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 주휴수당 조건 및 단시간 알바 계산법 완벽 정리"
          url="https://weknews.com/%ec%a3%bc%ed%9c%b4%ec%88%98%eb%8b%b9-%ea%b3%84%ec%82%b0%ea%b8%b0/"
        />
      </div>
    </div>
  );
}
