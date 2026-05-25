"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

export default function GoalTrackerPage() {
  const [targetAmount, setTargetAmount] = useState<number>(100000000); // 1억
  const [currentAmount, setCurrentAmount] = useState<number>(15000000); // 1500만
  const [monthlySavings, setMonthlySavings] = useState<number>(1500000); // 150만
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(5); // 5%

  const [monthsLeft, setMonthsLeft] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);

  useEffect(() => {
      if (targetAmount <= currentAmount) {
          setMonthsLeft(0);
          setFinalAmount(currentAmount);
          return;
      }
      if (monthlySavings <= 0 && annualReturnRate <= 0) {
          setMonthsLeft(-1); // Impossible
          return;
      }

      let months = 0;
      let balance = currentAmount;
      const monthlyRate = (annualReturnRate / 100) / 12;

      // Calculate months required
      // To prevent infinite loop in case of weird inputs, cap at 1200 months (100 years)
      while (balance < targetAmount && months < 1200) {
          balance = balance * (1 + monthlyRate) + monthlySavings;
          months++;
      }

      setMonthsLeft(months < 1200 ? months : -1);
      setFinalAmount(balance);
  }, [targetAmount, currentAmount, monthlySavings, annualReturnRate]);

  const progressPercent = Math.min((currentAmount / targetAmount) * 100, 100) || 0;

  const formatNumber = (num: number) => {
      return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getYearsAndMonths = (totalMonths: number) => {
      if (totalMonths === 0) return "이미 목표를 달성하셨습니다! 🎉";
      if (totalMonths === -1) return "현재 조건으로는 달성이 불가능합니다. 저축액을 늘려보세요!";
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      let result = "";
      if (years > 0) result += `${years}년 `;
      if (months > 0) result += `${months}개월 `;
      return result + "남았습니다.";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">1억 모으기 목표 달성기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 text-center space-y-2">
                <span className="text-4xl block mb-4">🎯</span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">D-Day 목표 달성기</h1>
                <p className="text-slate-400 text-sm">내 목표 금액까지 얼마나 남았을까요? 진척도를 확인해보세요.</p>
            </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">진행률</span>
                    <span className="text-2xl font-extrabold text-emerald-600">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>{formatNumber(currentAmount)}원</span>
                    <span>{formatNumber(targetAmount)}원</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">목표 금액 (원)</label>
                    <input type="number" value={targetAmount || ''} onChange={e => setTargetAmount(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">현재 모은 금액 (원)</label>
                    <input type="number" value={currentAmount || ''} onChange={e => setCurrentAmount(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">매월 추가 저축액 (원)</label>
                    <input type="number" value={monthlySavings || ''} onChange={e => setMonthlySavings(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">예상 연 수익률 (%)</label>
                    <div className="relative">
                        <input type="number" value={annualReturnRate || ''} onChange={e => setAnnualReturnRate(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100 shadow-inner">
                <p className="text-sm font-bold text-emerald-800 mb-2">목표 달성까지</p>
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mb-4 break-keep">
                    {getYearsAndMonths(monthsLeft)}
                </div>
                {monthsLeft > 0 && (
                    <p className="text-sm text-emerald-700/80">
                        꾸준히 모으시면 총 <span className="font-bold">{monthsLeft}개월</span> 뒤, 약 <span className="font-bold">{formatNumber(Math.floor(finalAmount / 10000) * 10000)}원</span>을 모으실 수 있어요!
                    </p>
                )}
            </div>

        </div>
      </div>
      
      <KakaoShareButton 
        title="D-Day 목표 달성기" 
        description="내 목표 금액까지 얼마나 남았을까요? 진척도를 확인해보세요!" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />
    </div>
  );
}
