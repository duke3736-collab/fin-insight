"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type DtiCapType = "regulated" | "non_regulated" | "special";
type RepaymentType = "equal_pi" | "equal_p" | "bullet";

export default function DtiCalculatorPage() {
  // Inputs
  const [incomeStr, setIncomeStr] = useState("60,000,000"); // 연소득
  const [dtiCapType, setDtiCapType] = useState<DtiCapType>("non_regulated"); // 비규제(60%) 기본

  // 기존 주담대 연간 원리금
  const [existingMortgageAnnualPIStr, setExistingMortgageAnnualPIStr] = useState("0");

  // 신규 주담대
  const [newLoanPrincipalStr, setNewLoanPrincipalStr] = useState("300,000,000");
  const [newLoanRate, setNewLoanRate] = useState(4.2);
  const [newLoanTermYears, setNewLoanTermYears] = useState(30);
  const [newLoanRepayment, setNewLoanRepayment] = useState<RepaymentType>("equal_pi");

  // 기타대출 (신용대출 등 - 이자만 DTI 반영)
  const [otherLoanPrincipalStr, setOtherLoanPrincipalStr] = useState("30,000,000");
  const [otherLoanRate, setOtherLoanRate] = useState(5.5);

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setIncomeStr(formatNumber(Math.min(num, 10000000000)));
  };

  const setQuickIncome = (val: number) => setIncomeStr(formatNumber(val));

  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    return result.trim() + "원";
  };

  // DTI 한도 (%)
  const dtiCapRate = useMemo(() => {
    switch (dtiCapType) {
      case "regulated":
        return 50; // 규제지역 50%
      case "non_regulated":
        return 60; // 비규제지역 60%
      case "special":
        return 60; // 서민실수요자 60%
    }
  }, [dtiCapType]);

  // 신규 주담대 연간 원리금 계산
  const newLoanAnnualPI = useMemo(() => {
    const principal = parseInputNumber(newLoanPrincipalStr);
    if (principal <= 0) return 0;

    const r = newLoanRate / 100 / 12;
    const totalMonths = newLoanTermYears * 12;

    if (newLoanRepayment === "bullet") {
      // 만기일시: 규제상 10년 산정원금 + 이자
      return principal / 10 + principal * (newLoanRate / 100);
    } else if (newLoanRepayment === "equal_pi") {
      if (r === 0) return principal / newLoanTermYears;
      const monthlyPmt =
        (principal * r * Math.pow(1 + r, totalMonths)) /
        (Math.pow(1 + r, totalMonths) - 1);
      return Math.floor(monthlyPmt * 12);
    } else {
      // 원금균등: 1년차 평균
      const monthlyP = principal / totalMonths;
      let firstYearInterestSum = 0;
      for (let m = 1; m <= 12; m++) {
        const remainingP = principal - monthlyP * (m - 1);
        firstYearInterestSum += remainingP * r;
      }
      return Math.floor(monthlyP * 12 + firstYearInterestSum);
    }
  }, [newLoanPrincipalStr, newLoanRate, newLoanTermYears, newLoanRepayment]);

  // 기타대출 연간 이자 (DTI는 기타대출 이자만 합산)
  const otherLoanAnnualInterest = useMemo(() => {
    const principal = parseInputNumber(otherLoanPrincipalStr);
    if (principal <= 0) return 0;
    return Math.floor(principal * (otherLoanRate / 100));
  }, [otherLoanPrincipalStr, otherLoanRate]);

  // DTI 계산 결과
  const dtiResult = useMemo(() => {
    const income = parseInputNumber(incomeStr);
    const existingPI = parseInputNumber(existingMortgageAnnualPIStr);

    const totalDtiAnnualDebt = existingPI + newLoanAnnualPI + otherLoanAnnualInterest;
    const dtiRatio = income > 0 ? (totalDtiAnnualDebt / income) * 100 : 0;

    // DTI 한도 기준 추가 주담대 최대 가능 금액 (30년 원리금균등 기준 역산)
    let maxAvailableLoan = 0;
    const maxAllowedAnnualPayment = income * (dtiCapRate / 100) - existingPI - otherLoanAnnualInterest;

    if (maxAllowedAnnualPayment > 0 && income > 0) {
      const maxMonthlyPmt = maxAllowedAnnualPayment / 12;
      const r = newLoanRate / 100 / 12;
      const totalMonths = newLoanTermYears * 12;

      if (r === 0) {
        maxAvailableLoan = maxMonthlyPmt * totalMonths;
      } else {
        const pv = maxMonthlyPmt * ((1 - Math.pow(1 + r, -totalMonths)) / r);
        maxAvailableLoan = Math.floor(pv);
      }
    }

    return {
      income,
      existingPI,
      newLoanAnnualPI,
      otherLoanAnnualInterest,
      totalDtiAnnualDebt,
      dtiRatio,
      dtiCapRate,
      maxAvailableLoan,
      isOverCap: dtiRatio > dtiCapRate,
    };
  }, [
    incomeStr,
    existingMortgageAnnualPIStr,
    newLoanAnnualPI,
    otherLoanAnnualInterest,
    dtiCapRate,
    newLoanRate,
    newLoanTermYears,
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-cyan-100 mb-3">
            2026년 최신 금융감독원 DTI 규제 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            📈 2026년 DTI & 총부채상환비율 계산기
          </h1>
          <p className="text-cyan-100 text-sm md:text-base max-w-2xl leading-relaxed">
            연소득과 주택담보대출 원리금, 기타대출(신용대출 등) 이자 상환액을 입력하여 
            <strong> DTI 비율(50%/60% 한도)</strong>과 <strong>추가 대출 가능 최대 금액</strong>을 확인해보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 연소득 및 규제지역 DTI 한도 */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                1. 소득 및 DTI 한도 규제 선택
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  세전 연간 총소득 (원)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={incomeStr}
                    onChange={handleIncomeChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    원
                  </span>
                </div>
                {incomeStr && (
                  <div className="mt-1 text-right text-xs font-bold text-cyan-600">
                    ≈ {formatKRWText(parseInputNumber(incomeStr))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[30000000, 50000000, 70000000, 100000000, 150000000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuickIncome(val)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      +{val / 100000000 >= 1 ? `${val / 100000000}억` : `${val / 10000}만`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  DTI 한도 적용 조건 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDtiCapType("regulated")}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                      dtiCapType === "regulated"
                        ? "bg-cyan-700 text-white border-cyan-700 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🔒 규제지역
                    <span className="block text-[10px] font-normal opacity-90 mt-0.5">DTI 50% 한도</span>
                  </button>

                  <button
                    onClick={() => setDtiCapType("non_regulated")}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                      dtiCapType === "non_regulated"
                        ? "bg-cyan-700 text-white border-cyan-700 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🌳 비규제지역
                    <span className="block text-[10px] font-normal opacity-90 mt-0.5">DTI 60% 한도</span>
                  </button>

                  <button
                    onClick={() => setDtiCapType("special")}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                      dtiCapType === "special"
                        ? "bg-cyan-700 text-white border-cyan-700 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ✨ 서민·실수요자
                    <span className="block text-[10px] font-normal opacity-90 mt-0.5">DTI 60% 우대</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. 주택담보대출 입력 (기존 & 신규) */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                2. 주택담보대출 상환액 (원금 + 이자 반영)
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  기존 주택담보대출 연간 원리금 상환액 (선택)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={existingMortgageAnnualPIStr}
                    onChange={(e) =>
                      setExistingMortgageAnnualPIStr(
                        formatNumber(parseInt(removeCommas(e.target.value), 10) || 0)
                      )
                    }
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-bold text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-cyan-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    원/년
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-slate-800 block">
                  🏡 신규 추가 주택담보대출 조건
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      신규 대출 금액 (원)
                    </label>
                    <input
                      type="text"
                      value={newLoanPrincipalStr}
                      onChange={(e) =>
                        setNewLoanPrincipalStr(
                          formatNumber(parseInt(removeCommas(e.target.value), 10) || 0)
                        )
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-right focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      예상 대출 금리 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newLoanRate}
                      onChange={(e) => setNewLoanRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-right focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      대출 만기 (년)
                    </label>
                    <select
                      value={newLoanTermYears}
                      onChange={(e) => setNewLoanTermYears(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value={10}>10년 만기</option>
                      <option value={20}>20년 만기</option>
                      <option value={30}>30년 만기</option>
                      <option value={40}>40년 만기</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      상환 방식
                    </label>
                    <select
                      value={newLoanRepayment}
                      onChange={(e) => setNewLoanRepayment(e.target.value as RepaymentType)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="equal_pi">원리금균등상환</option>
                      <option value="equal_p">원금균등상환</option>
                      <option value="bullet">만기일시상환</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 기타대출 (신용대출 등 - 이자만 반영) */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                3. 기타대출 (신용대출/자동차할부 등 - 이자만 DTI 반영)
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    기타대출 총 원금/잔액 (원)
                  </label>
                  <input
                    type="text"
                    value={otherLoanPrincipalStr}
                    onChange={(e) =>
                      setOtherLoanPrincipalStr(
                        formatNumber(parseInt(removeCommas(e.target.value), 10) || 0)
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-right focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    기타대출 평균 금리 (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={otherLoanRate}
                    onChange={(e) => setOtherLoanRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-right focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                * DTI는 신용대출 등 기타대출의 경우 원금 상환액을 제외하고 <strong>연간 이자 상환액만</strong> 부채에 반영합니다.
              </p>
            </div>

          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 DTI 산출 결과</span>
              </h2>
              <span
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md ${
                  !dtiResult.isOverCap
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700 animate-pulse"
                }`}
              >
                {!dtiResult.isOverCap ? "DTI 충족" : "DTI 한도 초과"}
              </span>
            </div>

            {/* DTI Main Display */}
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950 rounded-2xl p-6 text-white space-y-4 text-center">
              <span className="text-xs text-cyan-200 font-bold block">
                최종 예상 DTI 비율
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-cyan-300">
                {dtiResult.dtiRatio.toFixed(1)}%
                <span className="text-base text-slate-300 font-medium ml-1">
                  / {dtiResult.dtiCapRate}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    dtiResult.dtiRatio <= dtiResult.dtiCapRate - 10
                      ? "bg-cyan-400"
                      : !dtiResult.isOverCap
                      ? "bg-amber-400"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(dtiResult.dtiRatio, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1">
                <span>연간 소득: {formatKRWText(dtiResult.income)}</span>
                <span>한도: {dtiResult.dtiCapRate}%</span>
              </div>
            </div>

            {/* Max Available Additional Mortgage Loan */}
            <div className="p-5 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold text-cyan-900 block">
                💡 DTI 기준 추가 주담대 최대 가능 금액
              </span>
              <div className="text-2xl md:text-3xl font-black text-cyan-800">
                {formatNumber(dtiResult.maxAvailableLoan)}
                <span className="text-base font-bold text-slate-700 ml-1">원</span>
              </div>
              <p className="text-[11px] text-cyan-800 font-medium">
                ≈ {formatKRWText(dtiResult.maxAvailableLoan)} (주담대 30년 원리금균등 기준 추정)
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-3 text-xs md:text-sm border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>기존 주담대 연간 원리금</span>
                <span className="font-bold text-slate-800">{formatNumber(dtiResult.existingPI)} 원/년</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>신규 주담대 연간 원리금</span>
                <span className="font-bold text-slate-800">{formatNumber(dtiResult.newLoanAnnualPI)} 원/년</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>기타대출 연간 이자 상환액</span>
                <span className="font-bold text-slate-800">{formatNumber(dtiResult.otherLoanAnnualInterest)} 원/년</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2 font-bold">
                <span>총 연간 DTI 반영 상환액</span>
                <span className="text-cyan-700">{formatNumber(dtiResult.totalDtiAnnualDebt)} 원/년</span>
              </div>
            </div>

            {/* DTI vs DSR Warning Box */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[11px]">
              <div className="font-extrabold text-amber-800 flex items-center gap-1">
                ⚠️ DTI와 DSR 차이점 꼭 확인하세요!
              </div>
              <p className="text-amber-700 leading-snug">
                DTI를 충족하더라도 <strong>DSR(40%) 계산 시 기타대출 원금</strong>까지 부채에 포함되어 실제 대출 한도가 더 줄어들 수 있으므로 DSR 계산도 함께 필수 점검하세요.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 DTI & 총부채상환비율 계산기 - FinInsight"
                description={`내 예상 DTI 비율: ${dtiResult.dtiRatio.toFixed(1)}%! DTI 대출 가능 금액 약 ${formatKRWText(dtiResult.maxAvailableLoan)} 확인하기.`}
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
            📖 DTI(총부채상환비율) 핵심 규제 완벽 정리
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            DTI는 연간 총 소득 중 <strong>주택담보대출 원리금 상환액과 기타대출의 이자 상환액이 차지하는 비율</strong>입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🔍 DTI와 DSR의 결정적 차이
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>DTI:</strong> 주담대(원금+이자) + 기타대출(<strong>이자만</strong>)<br />
                <strong>DSR:</strong> 주담대(원금+이자) + 기타대출(<strong>원금+이자</strong>)
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🔒 지역별 DTI 규제 비율
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>규제지역(강남3구, 용산):</strong> DTI 50%<br />
                <strong>비규제지역(기타 수도권 등):</strong> DTI 60%
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
                <span>Q. 배우자의 소득도 DTI 계산 시 합산할 수 있나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                네, 주택담보대출 신청 시 부부합산 소득 증빙을 제출하면 부부 합산 소득과 부부 합산 부채를 기준으로 DTI를 산정받을 수 있습니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. DTI 한도는 통과했는데 은행에서 대출이 안 나온다고 합니다. 이유가 무엇인가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                주택담보대출 한도는 **LTV(담보인정비율), DTI(총부채상환비율), DSR(총부채원리금상환비율)** 3가지 규제 중 **가장 적은 한도를 가진 규제**를 적용받기 때문에 DSR이나 LTV 한도 초과 여부를 확인해야 합니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 금융 및 부동산 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/dsr"
              className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              📊 2026년 DSR & 대출한도 계산기
            </Link>
            <Link
              href="/calculators/ltv"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              🏠 2026년 LTV & 주담대한도 계산기
            </Link>
            <Link
              href="/calculators/property-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏢 2026년 재산세 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 DTI 규제 계산 및 DSR과의 결정적 차이점 비교 가이드"
          url="https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%eb%8c%80%ec%b6%9c-dti-%ea%b3%84%ec%82%b0%ea%b8%b8/"
        />
      </div>
    </div>
  );
}
