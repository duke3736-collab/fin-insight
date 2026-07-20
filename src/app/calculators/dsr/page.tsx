"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type LoanType = "mortgage" | "credit" | "car" | "other";
type RepaymentType = "equal_pi" | "equal_p" | "bullet";
type SectorType = "bank1" | "bank2"; // 1금융권(40%), 2금융권(50%)

interface LoanItem {
  id: string;
  name: string;
  type: LoanType;
  principal: number; // 원금/잔액 (원)
  rate: number; // 연이율 (%)
  termYears: number; // 만기 (년)
  repayment: RepaymentType;
}

export default function DsrCalculatorPage() {
  // 1. 소득 및 기본 옵션
  const [incomeStr, setIncomeStr] = useState("60,000,000"); // 연소득 6천만원 기본값
  const [sector, setSector] = useState<SectorType>("bank1"); // 1금융권 기본
  const [stressDsrRate, setStressDsrRate] = useState<number>(1.2); // 스트레스 금리 (+1.2%p 기본)

  // 2. 대출 목록 상태
  const [loans, setLoans] = useState<LoanItem[]>([
    {
      id: "1",
      name: "기존 주택담보대출",
      type: "mortgage",
      principal: 200000000, // 2억원
      rate: 4.2,
      termYears: 30,
      repayment: "equal_pi",
    },
    {
      id: "2",
      name: "기존 신용대출",
      type: "credit",
      principal: 30000000, // 3천만원
      rate: 5.5,
      termYears: 5,
      repayment: "bullet",
    },
  ]);

  // 3. 신규 희망 대출
  const [newLoanPrincipalStr, setNewLoanPrincipalStr] = useState("100,000,000");
  const [newLoanRate, setNewLoanRate] = useState(4.5);
  const [newLoanTermYears, setNewLoanTermYears] = useState(30);
  const [newLoanRepayment, setNewLoanRepayment] = useState<RepaymentType>("equal_pi");

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setIncomeStr(formatNumber(Math.min(num, 10000000000))); // 100억 제한
  };

  const handleNewLoanPrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setNewLoanPrincipalStr(formatNumber(Math.min(num, 5000000000))); // 50억 제한
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

  // 대출 추가/삭제
  const addLoan = () => {
    const newId = Date.now().toString();
    setLoans([
      ...loans,
      {
        id: newId,
        name: `대출 ${loans.length + 1}`,
        type: "credit",
        principal: 10000000,
        rate: 5.0,
        termYears: 5,
        repayment: "bullet",
      },
    ]);
  };

  const removeLoan = (id: string) => {
    setLoans(loans.filter((l) => l.id !== id));
  };

  const updateLoan = (id: string, field: keyof LoanItem, value: any) => {
    setLoans(
      loans.map((loan) => (loan.id === id ? { ...loan, [field]: value } : loan))
    );
  };

  // 연간 원리금 상환액 계산 함수 (DSR 산정 규칙 적용)
  const calcAnnualRepayment = (
    principal: number,
    annualRatePct: number,
    termYears: number,
    repayment: RepaymentType,
    type: LoanType,
    applyStressRate: number = 0
  ) => {
    if (principal <= 0) return 0;
    const effectiveRatePct = annualRatePct + applyStressRate;
    const r = effectiveRatePct / 100 / 12; // 월이율
    const totalMonths = termYears * 12;

    // 만기일시상환 또는 신용대출 산정만기 규칙
    if (repayment === "bullet") {
      // 규제상 DSR 산정 만기: 신용대출 5년, 기타대출 1년 등
      let regYears = termYears;
      if (type === "credit") regYears = 5; // 신용대출 DSR 산정 만기 5년
      else if (type === "car" || type === "other") regYears = 1; // 기타 1년

      const annualPrincipalRepayment = principal / regYears;
      const annualInterest = principal * (effectiveRatePct / 100);
      return annualPrincipalRepayment + annualInterest;
    }

    if (repayment === "equal_pi") {
      // 원리금 균등 상환: PMT × 12
      if (r === 0) return principal / termYears;
      const monthlyPmt =
        (principal * r * Math.pow(1 + r, totalMonths)) /
        (Math.pow(1 + r, totalMonths) - 1);
      return monthlyPmt * 12;
    } else {
      // 원금 균등 상환: 1년차 12개월 평균 원리금
      const monthlyPrincipal = principal / totalMonths;
      let firstYearInterestSum = 0;
      for (let m = 1; m <= 12; m++) {
        const remainingP = principal - monthlyPrincipal * (m - 1);
        firstYearInterestSum += remainingP * r;
      }
      return monthlyPrincipal * 12 + firstYearInterestSum;
    }
  };

  // 연간 총 소득
  const income = parseInputNumber(incomeStr);

  // 연간 기존 대출 원리금 상환액 계산 (기본 & 스트레스 적용)
  const existingAnnualRepayment = useMemo(() => {
    let normal = 0;
    let stress = 0;
    loans.forEach((loan) => {
      normal += calcAnnualRepayment(
        loan.principal,
        loan.rate,
        loan.termYears,
        loan.repayment,
        loan.type,
        0
      );
      stress += calcAnnualRepayment(
        loan.principal,
        loan.rate,
        loan.termYears,
        loan.repayment,
        loan.type,
        stressDsrRate
      );
    });
    return { normal: Math.floor(normal), stress: Math.floor(stress) };
  }, [loans, stressDsrRate]);

  // 신규 대출 연간 원리금
  const newLoanPrincipal = parseInputNumber(newLoanPrincipalStr);
  const newAnnualRepayment = useMemo(() => {
    const normal = calcAnnualRepayment(
      newLoanPrincipal,
      newLoanRate,
      newLoanTermYears,
      newLoanRepayment,
      "mortgage",
      0
    );
    const stress = calcAnnualRepayment(
      newLoanPrincipal,
      newLoanRate,
      newLoanTermYears,
      newLoanRepayment,
      "mortgage",
      stressDsrRate
    );
    return { normal: Math.floor(normal), stress: Math.floor(stress) };
  }, [newLoanPrincipal, newLoanRate, newLoanTermYears, newLoanRepayment, stressDsrRate]);

  // DSR 비율 계산
  const dsrCap = sector === "bank1" ? 40 : 50;

  const currentDsrNormal = income > 0 ? (existingAnnualRepayment.normal / income) * 100 : 0;
  const currentDsrStress = income > 0 ? (existingAnnualRepayment.stress / income) * 100 : 0;

  const totalDsrNormal = income > 0 ? ((existingAnnualRepayment.normal + newAnnualRepayment.normal) / income) * 100 : 0;
  const totalDsrStress = income > 0 ? ((existingAnnualRepayment.stress + newAnnualRepayment.stress) / income) * 100 : 0;

  // 추가 대출 가능 잔여 금액 역산 (주택담보대출 원리금균등 30년 만기 기준 추정)
  const maxAvailableNewLoan = useMemo(() => {
    if (income <= 0) return 0;
    const maxAllowedAnnualPayment = (income * (dsrCap / 100)) - existingAnnualRepayment.stress;
    if (maxAllowedAnnualPayment <= 0) return 0;

    // 월 허용 상환액
    const maxMonthlyPmt = maxAllowedAnnualPayment / 12;
    const effectiveRatePct = newLoanRate + stressDsrRate;
    const r = effectiveRatePct / 100 / 12;
    const totalMonths = newLoanTermYears * 12;

    if (r === 0) return maxMonthlyPmt * totalMonths;

    // PV = PMT * [(1 - (1+r)^-n) / r]
    const pv = maxMonthlyPmt * ((1 - Math.pow(1 + r, -totalMonths)) / r);
    return Math.floor(pv);
  }, [income, dsrCap, existingAnnualRepayment.stress, newLoanRate, stressDsrRate, newLoanTermYears]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-indigo-100 mb-3">
            2026년 최신 3단계 스트레스 DSR 규제 완벽 적용
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            📊 2026년 DSR & 대출한도 계산기
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl leading-relaxed">
            나의 연소득과 기존 대출 원리금을 입력하여 <strong>DSR 비율(40%/50% 한도)</strong>과 
            <strong> 스트레스 DSR 가산금리 적용 시 추가 대출 가능 금액</strong>을 즉시 확인해 보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. 소득 및 금융권 한도 선택 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>1. 연소득 및 DSR 한도 설정</span>
            </h2>

            {/* 연소득 */}
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
              {incomeStr && (
                <div className="mt-1 text-right text-xs font-bold text-indigo-600">
                  ≈ {formatKRWText(income)}
                </div>
              )}

              {/* Quick buttons */}
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

            {/* 금융권 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                DSR 적용 금융권 한도 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSector("bank1")}
                  className={`py-3 px-3 rounded-2xl text-xs md:text-sm font-bold border transition-all text-center ${
                    sector === "bank1"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🏦 1금융권 (시중은행)
                  <span className="block text-[11px] font-normal opacity-90 mt-0.5">DSR 40% 제한</span>
                </button>

                <button
                  onClick={() => setSector("bank2")}
                  className={`py-3 px-3 rounded-2xl text-xs md:text-sm font-bold border transition-all text-center ${
                    sector === "bank2"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🏢 2금융권 (보험/저축은행)
                  <span className="block text-[11px] font-normal opacity-90 mt-0.5">DSR 50% 제한</span>
                </button>
              </div>
            </div>

            {/* 스트레스 DSR 가산금리 옵션 */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-indigo-900">
                  ⚡ 스트레스 DSR 가산 금리 선택
                </label>
                <span className="text-xs font-bold text-indigo-700">+{stressDsrRate}%p</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[
                  { label: "미적용 (0%)", rate: 0 },
                  { label: "2단계 (+1.2%)", rate: 1.2 },
                  { label: "3단계 (+1.5%)", rate: 1.5 },
                ].map((item) => (
                  <button
                    key={item.rate}
                    onClick={() => setStressDsrRate(item.rate)}
                    className={`py-2 px-1.5 rounded-xl border transition-all ${
                      stressDsrRate === item.rate
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-indigo-700 pt-1">
                * 스트레스 DSR은 대출한도 산정 시 과거 금리 상승 위험을 가산(+0.75~1.5%p)하여 대출 한도를 더욱 꼼꼼하게 제한하는 제도입니다.
              </p>
            </div>
          </div>

          {/* 2. 보유 중인 대출 항목 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>2. 현재 보유 중인 기존 대출 목록</span>
              </h2>
              <button
                onClick={addLoan}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                + 대출 추가
              </button>
            </div>

            {loans.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                현재 보유 중인 대출이 없습니다. 대출 추가 버튼을 눌러 입력해 보세요.
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan, idx) => (
                  <div
                    key={loan.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={loan.name}
                        onChange={(e) => updateLoan(loan.id, "name", e.target.value)}
                        className="bg-transparent font-bold text-slate-800 text-xs md:text-sm border-b border-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => removeLoan(loan.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded"
                      >
                        삭제 ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          대출 종류
                        </label>
                        <select
                          value={loan.type}
                          onChange={(e) => updateLoan(loan.id, "type", e.target.value as LoanType)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="mortgage">주택담보대출</option>
                          <option value="credit">신용대출/마이너스</option>
                          <option value="car">자동차할부/카드론</option>
                          <option value="other">기타 대출</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          대출 잔액 (원)
                        </label>
                        <input
                          type="text"
                          value={formatNumber(loan.principal)}
                          onChange={(e) =>
                            updateLoan(
                              loan.id,
                              "principal",
                              parseInt(removeCommas(e.target.value), 10) || 0
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-right font-bold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          대출 금리 (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={loan.rate}
                          onChange={(e) =>
                            updateLoan(loan.id, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-right font-bold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          만기 및 방식
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={loan.termYears}
                            onChange={(e) =>
                              updateLoan(
                                loan.id,
                                "termYears",
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-12 bg-white border border-slate-300 rounded-xl px-1 py-1.5 text-xs text-center font-bold"
                          />
                          <select
                            value={loan.repayment}
                            onChange={(e) =>
                              updateLoan(loan.id, "repayment", e.target.value as RepaymentType)
                            }
                            className="w-full bg-white border border-slate-300 rounded-xl px-1 py-1.5 text-[11px] focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="equal_pi">원리금균등</option>
                            <option value="equal_p">원금균등</option>
                            <option value="bullet">만기일시</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. 신규 희망 대출 입력 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>3. 신규 추가 희망 대출</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  신규 희망 대출 금액 (원)
                </label>
                <input
                  type="text"
                  value={newLoanPrincipalStr}
                  onChange={handleNewLoanPrincipalChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-right font-black text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <span className="block text-right text-[11px] font-bold text-indigo-600 mt-0.5">
                  ≈ {formatKRWText(newLoanPrincipal)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  예상 대출 금리 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoanRate}
                  onChange={(e) => setNewLoanRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-right font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  대출 만기 (년)
                </label>
                <select
                  value={newLoanTermYears}
                  onChange={(e) => setNewLoanTermYears(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10년 만기</option>
                  <option value={20}>20년 만기</option>
                  <option value={30}>30년 만기</option>
                  <option value={40}>40년 만기 (1주택/청년)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  상환 방식
                </label>
                <select
                  value={newLoanRepayment}
                  onChange={(e) => setNewLoanRepayment(e.target.value as RepaymentType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="equal_pi">원리금균등상환</option>
                  <option value="equal_p">원금균등상환</option>
                  <option value="bullet">만기일시상환</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📈 DSR 진단 및 한도 결과</span>
              </h2>
              <span
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md ${
                  totalDsrStress <= dsrCap
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700 animate-pulse"
                }`}
              >
                {totalDsrStress <= dsrCap ? "대출 승인 가능 범위" : "DSR 한도 초과 위험"}
              </span>
            </div>

            {/* DSR Gauge Main Display */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-4 text-center">
              <span className="text-xs text-indigo-200 font-bold block">
                최종 예상 DSR (신규 대출 포함, 스트레스 반영)
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-emerald-400">
                {totalDsrStress.toFixed(1)}%
                <span className="text-base text-slate-300 font-medium ml-1">
                  / {dsrCap}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    totalDsrStress <= 35
                      ? "bg-emerald-400"
                      : totalDsrStress <= dsrCap
                      ? "bg-amber-400"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(totalDsrStress, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1">
                <span>현재 기존 DSR: {currentDsrStress.toFixed(1)}%</span>
                <span>허용 최대: {dsrCap}%</span>
              </div>
            </div>

            {/* Max Additional Loan Capacity Card */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold text-indigo-900 block">
                💡 추가 대출 가능 예상 최대 금액 (스트레스 기준)
              </span>
              <div className="text-2xl md:text-3xl font-black text-indigo-700">
                {formatNumber(maxAvailableNewLoan)}
                <span className="text-base font-bold text-slate-700 ml-1">원</span>
              </div>
              <p className="text-[11px] text-indigo-800 font-medium">
                ≈ {formatKRWText(maxAvailableNewLoan)} (주담대 30년 만기 원리금균등 기준 추정)
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-3 text-xs md:text-sm border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>연간 총 소득</span>
                <span className="font-bold text-slate-800">{formatNumber(income)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>기존 대출 연간 원리금</span>
                <span className="font-bold text-slate-800">
                  {formatNumber(existingAnnualRepayment.stress)} 원/년
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>신규 대출 연간 원리금</span>
                <span className="font-bold text-slate-800">
                  {formatNumber(newAnnualRepayment.stress)} 원/년
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2 font-bold">
                <span>총 연간 원리금 상환액</span>
                <span className="text-indigo-600">
                  {formatNumber(existingAnnualRepayment.stress + newAnnualRepayment.stress)} 원/년
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 DSR & 대출한도 계산기 - FinInsight"
                description={`내 예상 DSR: ${totalDsrStress.toFixed(1)}%! 추가 대출 가능 금액 약 ${formatKRWText(maxAvailableNewLoan)} 확인하기.`}
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
            📖 2026년 DSR(총부채원리금상환비율) 완벽 이해 가이드
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            DSR은 대출자의 <strong>모든 금융회사 대출 원리금 상환액을 연 소득으로 나눈 비율</strong>입니다. 소득 대비 대출 상환액 비율을 일정 수준으로 제한하여 과도한 부채 위험을 방지합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🏦 1금융권 vs 2금융권 DSR 한도 차이
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>1금융권(시중은행):</strong> DSR 40% 한도 적용<br />
                <strong>2금융권(보험, 저축은행, 카드사 등):</strong> DSR 50% 한도 적용
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                ⚡ 스트레스 DSR(Stress DSR)이란?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                향후 금리 인상 가능성을 감안하여 DSR 산정 시 **과거 금리변동 가산금리(+0.75%~+1.5%p)**를 더해 대출 한도를 더욱 보수적으로 제한하는 제도입니다.
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
                <span>Q. 마이너스 통장은 인출한 금액만 DSR에 포함되나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                아닙니다. 마이너스 통장(한도대출)은 실제 인출액과 상관없이 <strong>약정된 총 한도 전액</strong>을 기준으로 5년 만기 상환액을 산정하여 DSR에 반영합니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 전세자금대출이나 소액 생계비 대출도 DSR에 포함되나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                전세자금대출, 서민금융상품(햇살론 등), 300만 원 이하 소액 대출, 분양주택 중도금대출 등은 정책적 예외로 DSR 적용 대상에서 제외됩니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 금융 및 부동산 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/property-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏢 2026년 재산세 계산기
            </Link>
            <Link
              href="/calculators/real-estate-tax"
              className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              🏠 부동산 취득세 계산기
            </Link>
            <Link
              href="/calculators/apartment-roi"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              📈 아파트 투자 수익률 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 DSR 규제 완벽 해설 및 대출 한도 늘리는 법"
          url="https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%eb%8c%80%ec%b6%9c-dsr-%ea%b3%84%ec%82%b0%ea%b8%b0/"
        />
      </div>
    </div>
  );
}
