"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

export default function ZzantechCalculatorPage() {
  const [dailyAmount, setDailyAmount] = useState<number>(5000);
  const [frequency, setFrequency] = useState<number>(30); // 30: Daily, 4: Weekly, 1: Monthly
  const [period, setPeriod] = useState<number>(1); // Years

  const result = useMemo(() => {
    let monthlyAmount = 0;
    if (frequency === 30) monthlyAmount = dailyAmount * 30;
    if (frequency === 4) monthlyAmount = dailyAmount * 4;
    if (frequency === 1) monthlyAmount = dailyAmount * 1;

    const totalMonths = period * 12;
    const pureTotal = monthlyAmount * totalMonths;

    const r = 0.05 / 12;
    let compoundTotal = 0;
    for(let i = 0; i < totalMonths; i++) {
        compoundTotal = (compoundTotal + monthlyAmount) * (1 + r);
    }

    let verdict = "";
    if (compoundTotal < 1000000) { 
        verdict = "제주도 왕복 항공권에 특급 호텔 1박이 가능합니다! ✈️"; 
    }
    else if (compoundTotal < 5000000) { 
        verdict = "최신형 맥북 프로를 사고도 남는 거금이 되었습니다! 💻"; 
    }
    else if (compoundTotal < 20000000) { 
        verdict = "유럽 한 달 살기 풀패키지가 가능한 수준입니다! 🏰"; 
    }
    else { 
        verdict = "이 정도면 소형 중고차 한 대를 뽑을 수 있는 태산이 되었네요! 🚗"; 
    }

    return { pureTotal, compoundTotal, verdict };
  }, [dailyAmount, frequency, period]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">짠테크 수익 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Widget Container - Dark Glassmorphism Theme */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl border border-indigo-500/20 text-slate-100 p-8 md:p-12">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Duke Project</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">오늘의 짠테크 계산기</h1>
                <p className="text-sm text-slate-400">티끌 모아 태산! 내가 아낀 돈의 미래 가치는?</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">오늘 참은 지출 (예: 커피, 배달)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={dailyAmount || ''}
                            onChange={(e) => setDailyAmount(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="5000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">원</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">참는 주기</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setFrequency(30)} className={`py-3 text-sm font-medium rounded-xl transition-all ${frequency === 30 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>매일</button>
                        <button onClick={() => setFrequency(4)} className={`py-3 text-sm font-medium rounded-xl transition-all ${frequency === 4 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>매주 (월4회)</button>
                        <button onClick={() => setFrequency(1)} className={`py-3 text-sm font-medium rounded-xl transition-all ${frequency === 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>매월 (월1회)</button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">목표 기간</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setPeriod(1)} className={`py-3 text-sm font-medium rounded-xl transition-all ${period === 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>1년</button>
                        <button onClick={() => setPeriod(5)} className={`py-3 text-sm font-medium rounded-xl transition-all ${period === 5 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>5년</button>
                        <button onClick={() => setPeriod(10)} className={`py-3 text-sm font-medium rounded-xl transition-all ${period === 10 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>10년</button>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-2xl p-5 text-center">
                        <span className="block text-xs text-slate-400 mb-2">단순 모은 금액</span>
                        <span className="block text-xl md:text-2xl font-bold text-white">{Math.round(result.pureTotal).toLocaleString()}원</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
                        <div className="relative z-10">
                            <span className="block text-xs text-slate-400 mb-2">연 5% 복리 적용 시</span>
                            <span className="block text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">{Math.round(result.compoundTotal).toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-center p-4 rounded-xl text-sm font-medium">
                    {result.verdict}
                </div>
            </div>
        </div>
      </div>
      
      <KakaoShareButton 
        title="짠테크 수익 계산기" 
        description="오늘 커피 한 잔 아끼면 미래에 얼마가 될까요?" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />
    </div>
  );
}
