"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

export default function HealthInsuranceCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"employee" | "regional">("employee");

  // Employee State
  const [empSalary, setEmpSalary] = useState<number>(0);
  const [empExtraBiz, setEmpExtraBiz] = useState<number>(0);
  const [empExtraPension, setEmpExtraPension] = useState<number>(0);
  const [empExtraEarned, setEmpExtraEarned] = useState<number>(0);
  const [empExtraRental, setEmpExtraRental] = useState<number>(0);

  // Regional State
  const [regIncBiz, setRegIncBiz] = useState<number>(0);
  const [regIncPension, setRegIncPension] = useState<number>(0);
  const [regIncEarned, setRegIncEarned] = useState<number>(0);
  const [regIncRental, setRegIncRental] = useState<number>(0);
  
  const [regPropHouse, setRegPropHouse] = useState<number>(0);
  const [regPropBuilding, setRegPropBuilding] = useState<number>(0);
  const [regPropLand, setRegPropLand] = useState<number>(0);
  const [regPropJeonse, setRegPropJeonse] = useState<number>(0);
  const [regPropMonthlyDep, setRegPropMonthlyDep] = useState<number>(0);
  const [regPropMonthlyRent, setRegPropMonthlyRent] = useState<number>(0);
  const [regPropShip, setRegPropShip] = useState<number>(0);
  const [regPropAir, setRegPropAir] = useState<number>(0);
  const [regDebt, setRegDebt] = useState<number>(0);
  const [isRural, setIsRural] = useState<boolean>(false);

  // 2026 Rates
  const RATE_HEALTH = 0.0719; // 7.19%
  const RATE_CARE = 0.1314; // 13.14% of health insurance

  const getPropertyScore = (amount: number) => {
    let net = amount - 100000000; // 1억 기본공제
    if (net <= 0) return 0;
    if (net <= 4500000) return 22;
    if (net <= 9000000) return 30;
    if (net <= 13500000) return 38;
    if (net <= 18000000) return 47;
    
    let score = 50 + Math.pow(net / 10000000, 0.85) * 15;
    if (score > 2341) score = 2341; 
    return Math.floor(score);
  };

  const results = useMemo(() => {
    let totalHealth = 0;
    let totalCare = 0;
    let workerHealth = 0;
    let workerCare = 0;
    let ownerHealth = 0;
    let ownerCare = 0;
    let hasInput = false;

    if (activeTab === 'employee') {
        if (empSalary > 0 || empExtraBiz > 0 || empExtraPension > 0 || empExtraEarned > 0 || empExtraRental > 0) hasInput = true;
        
        // Base premium
        let baseHealth = Math.floor(empSalary * RATE_HEALTH);
        
        // Extra income premium (> 20M)
        let extraIncomeTotal = empExtraBiz + empExtraRental + ((empExtraPension + empExtraEarned) * 0.5);
        let extraHealth = 0;
        if (extraIncomeTotal > 20000000) {
            let monthlyExtraTarget = Math.floor((extraIncomeTotal - 20000000) / 12);
            extraHealth = Math.floor(monthlyExtraTarget * RATE_HEALTH);
        }
        
        totalHealth = baseHealth + extraHealth;
        workerHealth = Math.floor(baseHealth / 2) + extraHealth;
        ownerHealth = baseHealth - Math.floor(baseHealth / 2);
        
        // Care premium
        let baseCare = Math.floor(baseHealth * RATE_CARE);
        let extraCare = Math.floor(extraHealth * RATE_CARE);
        totalCare = baseCare + extraCare;
        workerCare = Math.floor(baseCare / 2) + extraCare;
        ownerCare = baseCare - Math.floor(baseCare / 2);
    } else {
        if (regIncBiz > 0 || regIncPension > 0 || regIncEarned > 0 || regIncRental > 0 ||
            regPropHouse > 0 || regPropBuilding > 0 || regPropLand > 0 || 
            regPropJeonse > 0 || regPropMonthlyDep > 0 || regPropMonthlyRent > 0 || 
            regPropShip > 0 || regPropAir > 0) {
            hasInput = true;
        }
        
        // Income calculation
        const taxableIncome = regIncBiz + regIncRental + ((regIncPension + regIncEarned) * 0.5);
        let monthlyIncomePremium = Math.floor((taxableIncome * RATE_HEALTH) / 12);
        
        // Property calculation
        const rentVal = (regPropJeonse + regPropMonthlyDep + (regPropMonthlyRent * 40)) * 0.3;
        let totalProp = regPropHouse + regPropBuilding + regPropLand + regPropShip + regPropAir + rentVal;
        
        totalProp = Math.max(0, totalProp - regDebt); // Debt deduction
        
        const propScore = getPropertyScore(totalProp);
        let monthlyPropPremium = Math.floor(propScore * 208.4);
        
        totalHealth = monthlyIncomePremium + monthlyPropPremium;
        
        if (totalHealth > 0 && totalHealth < 19780) totalHealth = 19780; // Minimum bound
        if (isRural) totalHealth = Math.floor(totalHealth * 0.78); // 22% discount
        
        totalCare = Math.floor(totalHealth * RATE_CARE);
        
        workerHealth = totalHealth;
        workerCare = totalCare;
    }

    return { hasInput, totalHealth, totalCare, workerHealth, workerCare, ownerHealth, ownerCare };
  }, [activeTab, empSalary, empExtraBiz, empExtraPension, empExtraEarned, empExtraRental, regIncBiz, regIncPension, regIncEarned, regIncRental, regPropHouse, regPropBuilding, regPropLand, regPropJeonse, regPropMonthlyDep, regPropMonthlyRent, regPropShip, regPropAir, regDebt, isRural]);

  const handleInput = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      setter(val ? parseInt(val, 10) : 0);
  };

  const InputRow = ({ label, value, setter, placeholder="0" }: { label: string, value: number, setter: (v: number) => void, placeholder?: string }) => (
      <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
          <div className="relative">
              <input type="text" value={value === 0 ? '' : value.toLocaleString('ko-KR')} onChange={handleInput(setter)} placeholder={placeholder} className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-2.5 px-4 pr-8 text-right font-medium text-slate-800 transition-all outline-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
          </div>
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">건강보험료 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                건강보험료 계산기
            </h1>
            <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-semibold">2026 최신 반영</span>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200">
            <button onClick={() => setActiveTab('employee')} className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'employee' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>🏢 직장가입자</button>
            <button onClick={() => setActiveTab('regional')} className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'regional' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>🏠 지역가입자</button>
        </div>

        <div className="p-6 md:p-8">
            
            {activeTab === 'employee' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <InputRow label="보수월액 (월 급여 세전)" value={empSalary} setter={setEmpSalary} placeholder="예: 3,000,000" />
                    
                    <div>
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                            <h3 className="text-base font-bold text-slate-800">보수(월급) 외 소득 (연)</h3>
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-semibold">2,000만원 초과 시 추가 부과</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputRow label="사업소득 등" value={empExtraBiz} setter={setEmpExtraBiz} />
                            <InputRow label="연금소득" value={empExtraPension} setter={setEmpExtraPension} />
                            <InputRow label="근로소득" value={empExtraEarned} setter={setEmpExtraEarned} />
                            <InputRow label="분리과세 주택임대소득" value={empExtraRental} setter={setEmpExtraRental} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'regional' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 leading-relaxed">
                        💡 <b>2024년 2월 개정안 반영:</b> 자동차 부과 폐지, 재산 1억 원 기본공제 적용
                    </div>
                    
                    <div>
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">소득금액 (연소득 기준)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputRow label="사업소득 등" value={regIncBiz} setter={setRegIncBiz} />
                            <InputRow label="연금소득" value={regIncPension} setter={setRegIncPension} />
                            <InputRow label="근로소득" value={regIncEarned} setter={setRegIncEarned} />
                            <InputRow label="분리과세 주택임대소득" value={regIncRental} setter={setRegIncRental} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">재산금액 (과세표준액 기준)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputRow label="주택" value={regPropHouse} setter={setRegPropHouse} />
                            <InputRow label="건물" value={regPropBuilding} setter={setRegPropBuilding} />
                            <InputRow label="토지" value={regPropLand} setter={setRegPropLand} />
                            <InputRow label="전세 (보증금)" value={regPropJeonse} setter={setRegPropJeonse} />
                            <InputRow label="월세 (보증금)" value={regPropMonthlyDep} setter={setRegPropMonthlyDep} />
                            <InputRow label="월세 (월 납입액)" value={regPropMonthlyRent} setter={setRegPropMonthlyRent} />
                            <InputRow label="선박" value={regPropShip} setter={setRegPropShip} />
                            <InputRow label="항공기" value={regPropAir} setter={setRegPropAir} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">기타 공제 및 감면</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <InputRow label="주택금융부채 (대출잔액)" value={regDebt} setter={setRegDebt} />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors w-max">
                            <input type="checkbox" checked={isRural} onChange={(e) => setIsRural(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                            농어촌 지역 거주 여부 (22% 감면)
                        </label>
                    </div>
                </div>
            )}

            {/* Results */}
            {results.hasInput && (
                <div className="mt-8 pt-8 border-t border-dashed border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-center text-lg font-bold text-slate-800 mb-6">예상 월 납부액</h2>
                    
                    <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                            <span className="text-sm font-medium text-slate-600">총 건강보험료</span>
                            <span className="text-base font-bold text-blue-600">{results.totalHealth.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-slate-600">총 장기요양보험료</span>
                            <span className="text-base font-bold text-emerald-600">{results.totalCare.toLocaleString()}원</span>
                        </div>
                    </div>

                    {activeTab === 'employee' && (
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                <span className="block text-xs font-semibold text-slate-800 mb-2">근로자 부담 (50%)</span>
                                <span className="block text-xl font-black text-blue-600 mb-1">{(results.workerHealth + results.workerCare).toLocaleString()}원</span>
                                <span className="block text-[11px] text-slate-500">건보 {results.workerHealth.toLocaleString()} + 요양 {results.workerCare.toLocaleString()}</span>
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                <span className="block text-xs font-semibold text-slate-800 mb-2">사업주 부담 (50%)</span>
                                <span className="block text-xl font-black text-slate-600 mb-1">{(results.ownerHealth + results.ownerCare).toLocaleString()}원</span>
                                <span className="block text-[11px] text-slate-500">건보 {results.ownerHealth.toLocaleString()} + 요양 {results.ownerCare.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-600 text-white rounded-xl p-6 flex justify-between items-center shadow-lg shadow-blue-600/20">
                        <span className="font-semibold">{activeTab === 'employee' ? '근로자 월 총 납부액' : '가구 월 총 납부액'}</span>
                        <span className="text-2xl md:text-3xl font-black">{(results.workerHealth + results.workerCare).toLocaleString()}원</span>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      <ShareButtons 
        title="건강보험료 계산기" 
        description="직장인, 프리랜서, 자영업자를 위한 정확한 건강보험료 계산기" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            <WordPressLink title="소득 하위 70% 부부 맞벌이 건보료 기준" url="https://weknews.com/%ec%86%8c%eb%93%9d-%ed%95%98%ec%9c%84-70-%eb%b6%80%eb%b6%80-%eb%a7%9e%eb%b2%8c%ec%9d%b4-%ea%b1%b4%eb%b3%b4%eb%a3%8c/" />
            <WordPressLink title="직장가입자 vs 지역가입자 건강보험료 비교" url="https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ec%a7%80%ec%9b%90%ea%b8%88-%ec%a7%81%ec%9e%a5%ea%b0%80%ec%9e%85%ec%9e%90-vs-%ec%a7%80%ec%97%ad%ea%b0%80%ec%9e%85%ec%9e%90/" />
          </div>
        </section>
      </article>
    </div>
  );
}
