"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

// 2026 rates
const RATES = {
  minimumWage: 10320,
  minimumMonthly: 2156880,
  nationalPension: 0.0475,
  healthInsurance: 0.03595,
  longTermCare: 0.1314,
  employmentInsurance: 0.009,
  pensionMax: 6170000,
  pensionMin: 400000,
  nonTaxMeal: 200000,
};

const TAX_BRACKETS = [
  { limit: 14000000, rate: 0.06, deduction: 0 },
  { limit: 50000000, rate: 0.15, deduction: 1260000 },
  { limit: 88000000, rate: 0.24, deduction: 5760000 },
  { limit: 150000000, rate: 0.35, deduction: 15440000 },
  { limit: 300000000, rate: 0.38, deduction: 19940000 },
  { limit: 500000000, rate: 0.40, deduction: 25940000 },
  { limit: 1000000000, rate: 0.42, deduction: 35940000 },
  { limit: Infinity, rate: 0.45, deduction: 65940000 },
];

function getEarnedIncomeDeduction(totalSalary: number) {
  if (totalSalary <= 5000000) return totalSalary * 0.7;
  if (totalSalary <= 15000000) return 3500000 + (totalSalary - 5000000) * 0.4;
  if (totalSalary <= 45000000) return 7500000 + (totalSalary - 15000000) * 0.15;
  if (totalSalary <= 100000000) return 12000000 + (totalSalary - 45000000) * 0.05;
  return 14750000 + (totalSalary - 100000000) * 0.02;
}

function getChildTaxCredit(children: number) {
  if (children <= 0) return 0;
  if (children === 1) return 150000;
  if (children === 2) return 350000;
  return 350000 + (children - 2) * 300000;
}

function calculateMonthlyIncomeTax(monthlySalary: number, nonTaxable: number, dependents: number, children: number) {
  const monthlyTaxable = Math.max(0, monthlySalary - nonTaxable);
  const annualTaxable = monthlyTaxable * 12;

  const earnedDeduction = getEarnedIncomeDeduction(annualTaxable);
  let taxableIncome = annualTaxable - earnedDeduction;

  const personalDeduction = dependents * 1500000;
  taxableIncome -= personalDeduction;

  const pensionBase = Math.min(Math.max(monthlySalary, RATES.pensionMin), RATES.pensionMax);
  const annualPension = pensionBase * RATES.nationalPension * 12;
  taxableIncome -= annualPension;

  const healthAnnual = monthlySalary * RATES.healthInsurance * 12;
  const longTermAnnual = healthAnnual * RATES.longTermCare;
  taxableIncome -= (healthAnnual + longTermAnnual);

  const employmentAnnual = monthlySalary * RATES.employmentInsurance * 12;
  taxableIncome -= employmentAnnual;

  taxableIncome -= 130000; // standard deduction
  taxableIncome = Math.max(0, taxableIncome);

  let annualTax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.limit) {
      annualTax = taxableIncome * bracket.rate - bracket.deduction;
      break;
    }
  }
  annualTax = Math.max(0, annualTax);

  let taxCredit = 0;
  if (annualTax <= 1300000) taxCredit = annualTax * 0.55;
  else taxCredit = 715000 + (annualTax - 1300000) * 0.3;

  if (annualTax <= 33000000) taxCredit = Math.min(taxCredit, 740000);
  else if (annualTax <= 70000000) taxCredit = Math.min(taxCredit, 660000);
  else taxCredit = Math.min(taxCredit, 500000);

  annualTax -= taxCredit;

  const childCredit = getChildTaxCredit(children);
  annualTax -= childCredit;

  annualTax = Math.max(0, annualTax);

  return Math.floor(annualTax / 12);
}

function calculateInsurance(monthlySalary: number) {
  const pensionBase = Math.min(Math.max(monthlySalary, RATES.pensionMin), RATES.pensionMax);
  const pension = Math.floor((pensionBase * RATES.nationalPension) / 10) * 10;
  const health = Math.floor((monthlySalary * RATES.healthInsurance) / 10) * 10;
  const longTerm = Math.floor((health * RATES.longTermCare) / 10) * 10;
  const employment = Math.floor((monthlySalary * RATES.employmentInsurance) / 10) * 10;
  return { pension, health, longTerm, employment };
}

export default function SalaryCalculatorPage() {
  const [salaryType, setSalaryType] = useState<"monthly" | "yearly">("yearly");
  const [salaryStr, setSalaryStr] = useState("50,000,000");
  const [nontaxStr, setNontaxStr] = useState("200,000");
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") { setter(""); return; }
    value = value.replace(/[^\d]/g, "");
    const num = parseInt(value, 10);
    setter(formatNumber(num || 0));
  };

  const handleSalaryTypeChange = (type: "monthly" | "yearly") => {
    setSalaryType(type);
    if (type === "monthly") {
      setSalaryStr(formatNumber(3000000));
    } else {
      setSalaryStr(formatNumber(40000000));
    }
  };

  const setQuickSalary = (val: number) => setSalaryStr(formatNumber(val));

  const result = useMemo(() => {
    const rawSalary = parseInt(removeCommas(salaryStr), 10) || 0;
    const monthlySalary = salaryType === "yearly" ? Math.floor(rawSalary / 12) : rawSalary;
    const nonTaxable = parseInt(removeCommas(nontaxStr), 10) || 0;

    const insurance = calculateInsurance(monthlySalary);
    const incomeTax = calculateMonthlyIncomeTax(monthlySalary, nonTaxable, dependents, children);
    const localTax = Math.floor((incomeTax * 0.1) / 10) * 10;

    const totalDeduction = insurance.pension + insurance.health + insurance.longTerm + insurance.employment + incomeTax + localTax;
    const netSalary = monthlySalary - totalDeduction;

    const yearlyGross = monthlySalary * 12;
    const yearlyNet = netSalary * 12;

    return {
      monthlySalary,
      netSalary,
      insurance,
      incomeTax,
      localTax,
      totalDeduction,
      deductionRate: monthlySalary > 0 ? (totalDeduction / monthlySalary) * 100 : 0,
      yearlyGross,
      yearlyNet
    };
  }, [salaryType, salaryStr, nontaxStr, dependents, children]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">연봉 실수령액 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden p-6 md:p-10 text-slate-200">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full text-xs mb-6">
            ✨ 2026년 최신 요율 완벽 반영
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4 text-2xl">
            💰
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">연봉 실수령액 계산기</h1>
          <p className="text-indigo-400 font-medium text-sm">내 급여에서 세금이 얼마나 빠져나갈까?</p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 border border-slate-700/50">
              <button 
                onClick={() => handleSalaryTypeChange('monthly')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${salaryType === 'monthly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                월급 기준
              </button>
              <button 
                onClick={() => handleSalaryTypeChange('yearly')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${salaryType === 'yearly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                연봉 기준
              </button>
            </div>

            <label className="block text-sm font-bold text-slate-200 mb-2">{salaryType === 'yearly' ? '연봉 (세전)' : '월급 (세전)'}</label>
            <div className="relative mb-3">
              <input 
                type="text" 
                value={salaryStr} 
                onChange={handleCurrencyChange(setSalaryStr)} 
                className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-4 pl-5 pr-14 text-white text-lg font-bold outline-none focus:border-indigo-400 text-right transition-colors" 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {salaryType === 'yearly' ? (
                <>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10" onClick={() => setQuickSalary(30000000)}>3천만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10" onClick={() => setQuickSalary(40000000)}>4천만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10" onClick={() => setQuickSalary(50000000)}>5천만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10" onClick={() => setQuickSalary(70000000)}>7천만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10" onClick={() => setQuickSalary(100000000)}>1억</button>
                </>
              ) : (
                <>
                  <button className="flex-1 py-2 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors whitespace-nowrap" onClick={() => setQuickSalary(RATES.minimumMonthly)}>최저월급</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickSalary(30000000/12)}>3천 연봉수준</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickSalary(3000000)}>300만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickSalary(4000000)}>400만</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickSalary(5000000)}>500만</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">비과세액 <span className="text-slate-500 font-normal text-xs ml-1">(식대 등)</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={nontaxStr} 
                  onChange={handleCurrencyChange(setNontaxStr)} 
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 pl-4 pr-12 text-white font-bold outline-none focus:border-indigo-400 text-right" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2 text-center">부양가족 수</label>
                <div className="flex items-center justify-between bg-slate-800/80 border border-slate-600 rounded-xl overflow-hidden">
                  <button className="w-10 h-11 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors font-bold" onClick={() => setDependents(Math.max(1, dependents - 1))}>-</button>
                  <div className="flex-1 text-center font-bold text-white text-lg">{dependents}</div>
                  <button className="w-10 h-11 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors font-bold" onClick={() => setDependents(Math.min(20, dependents + 1))}>+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2 text-center">20세 이하 자녀</label>
                <div className="flex items-center justify-between bg-slate-800/80 border border-slate-600 rounded-xl overflow-hidden">
                  <button className="w-10 h-11 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors font-bold" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                  <div className="flex-1 text-center font-bold text-white text-lg">{children}</div>
                  <button className="w-10 h-11 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors font-bold" onClick={() => setChildren(Math.min(20, children + 1))}>+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden mt-8">
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-slate-400 mb-2">월 예상 실수령액</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-emerald-400 mb-2">
                {formatNumber(result.netSalary)}원
              </div>
              <div className="text-xs text-slate-500 font-bold">공제 합계: -{formatNumber(result.totalDeduction)}원 ({result.deductionRate.toFixed(1)}%)</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
              <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-700 shadow-inner">
                <div className="h-full bg-emerald-500" style={{ width: `${100 - result.deductionRate}%` }}></div>
                <div className="h-full bg-indigo-400" style={{ width: `${result.insurance.pension / result.monthlySalary * 100}%` }}></div>
                <div className="h-full bg-cyan-400" style={{ width: `${result.insurance.health / result.monthlySalary * 100}%` }}></div>
                <div className="h-full bg-blue-400" style={{ width: `${result.insurance.longTerm / result.monthlySalary * 100}%` }}></div>
                <div className="h-full bg-purple-400" style={{ width: `${result.insurance.employment / result.monthlySalary * 100}%` }}></div>
                <div className="h-full bg-rose-400" style={{ width: `${result.incomeTax / result.monthlySalary * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] md:text-xs text-slate-400 mt-2 font-bold px-1">
                <span className="text-emerald-400">실수령액</span>
                <span className="text-rose-300">세금 및 공제액</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="text-slate-300 font-bold">국민연금</span>
                  <span className="text-slate-500 text-[10px]">({(RATES.nationalPension * 100).toFixed(2)}%)</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.insurance.pension)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-slate-300 font-bold">건강보험</span>
                  <span className="text-slate-500 text-[10px]">({(RATES.healthInsurance * 100).toFixed(3)}%)</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.insurance.health)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-slate-300 font-bold">장기요양보험</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.insurance.longTerm)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-slate-300 font-bold">고용보험</span>
                  <span className="text-slate-500 text-[10px]">({(RATES.employmentInsurance * 100).toFixed(1)}%)</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.insurance.employment)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <span className="text-slate-300 font-bold">소득세</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.incomeTax)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-slate-300 font-bold">지방소득세</span>
                  <span className="text-slate-500 text-[10px]">(소득세의 10%)</span>
                </div>
                <span className="text-rose-300 font-bold">-{formatNumber(result.localTax)}원</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300">연 환산 실수령액</span>
              <span className="text-lg font-black text-emerald-400">{formatNumber(result.yearlyNet)}원</span>
            </div>
            
          </div>
        </div>

        <div className="mt-8">
           <KakaoShareButton 
             title="2026년 기준 연봉 실수령액 계산기" 
             description="내 월급에서 세금이 얼마나 빠져나갈까? 1초 만에 확인해보세요!" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">💡 연봉 실수령액 상식</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            연봉이 올라도 통장에 찍히는 실수령액이 기대만큼 오르지 않는 이유는 대한민국의 조세제도가 누진세율 구조이기 때문입니다. 급여가 높을수록 4대보험료와 소득세 차감 비율이 더 커집니다.
            <br/><br/>
            특히 연말정산을 대비하여 평소에 신용카드/체크카드 사용 비율을 조절하거나, 연금저축펀드 및 IRP(개인형 퇴직연금)를 통해 세액공제 혜택을 미리 챙겨두시는 것이 유리합니다.
          </p>
        </section>
      </article>
    </div>
  );
}
