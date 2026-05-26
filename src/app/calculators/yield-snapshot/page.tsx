"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

export default function YieldSnapshotPage() {
  const [stockName, setStockName] = useState<string>("엔비디아 (NVIDIA)");
  const [buyPrice, setBuyPrice] = useState<number>(100);
  const [currentPrice, setCurrentPrice] = useState<number>(135);
  const [quantity, setQuantity] = useState<number>(100);
  
  const [theme, setTheme] = useState<"dark" | "light" | "purple">("dark");

  const totalBuy = buyPrice * quantity;
  const totalCurrent = currentPrice * quantity;
  const profit = totalCurrent - totalBuy;
  const yieldRate = totalBuy > 0 ? (profit / totalBuy) * 100 : 0;
  
  const isProfit = profit >= 0;

  const formatNumber = (num: number) => {
      return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getThemeClasses = () => {
      switch(theme) {
          case 'dark':
              return 'bg-slate-900 border-slate-700 text-white';
          case 'light':
              return 'bg-white border-slate-200 text-slate-800';
          case 'purple':
              return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-purple-500/30 text-white';
      }
  };

  const getProfitColor = () => {
      if (theme === 'light') return isProfit ? 'text-red-500' : 'text-blue-500';
      return isProfit ? 'text-rose-400' : 'text-sky-400';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">수익률 인증샷 메이커</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-8">
        
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">📸 수익률 인증샷 메이커</h1>
            <p className="text-sm text-slate-500">내 주식 수익률을 멋진 카드로 만들어 공유해보세요!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">종목명</label>
                <input type="text" value={stockName} onChange={e => setStockName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">수량</label>
                <input type="number" value={quantity || ''} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">매수 단가</label>
                <input type="number" value={buyPrice || ''} onChange={e => setBuyPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">현재가</label>
                <input type="number" value={currentPrice || ''} onChange={e => setCurrentPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
            </div>
        </div>

        <div className="pt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">테마 선택</label>
            <div className="flex gap-2">
                <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>다크</button>
                <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border ${theme === 'light' ? 'bg-white text-slate-900 border-slate-400 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>라이트</button>
                <button onClick={() => setTheme('purple')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border ${theme === 'purple' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>오로라</button>
            </div>
        </div>

        {/* Preview Card */}
        <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="mb-4 flex justify-between items-end">
                <h2 className="font-bold text-slate-800">미리보기</h2>
                <span className="text-xs text-slate-500">화면을 캡처해서 공유해보세요!</span>
            </div>
            
            <div className={`p-8 md:p-10 rounded-3xl shadow-2xl border transition-colors duration-300 relative overflow-hidden ${getThemeClasses()}`}>
                
                {theme === 'dark' && (
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
                )}
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className={`text-xl md:text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{stockName || '종목명'}</h3>
                            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{formatNumber(quantity)}주</p>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-300'}`}>
                            FinInsight
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>수익률</p>
                        <div className={`text-5xl md:text-6xl font-extrabold tracking-tight flex items-baseline gap-2 ${getProfitColor()}`}>
                            {isProfit ? '+' : ''}{yieldRate.toFixed(2)}<span className="text-3xl">%</span>
                        </div>
                    </div>

                    <div className={`pt-6 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/10'} grid grid-cols-2 gap-4`}>
                        <div>
                            <p className={`text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>평가손익</p>
                            <p className={`text-lg font-bold ${getProfitColor()}`}>
                                {isProfit ? '+' : ''}{formatNumber(profit)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>총 평가금액</p>
                            <p className={`text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                {formatNumber(totalCurrent)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">💡 스마트폰에서 화면을 캡처한 뒤 이미지를 잘라서 사용하세요.</p>
        </div>

      </div>
      
      <ShareButtons 
        title="수익률 인증샷 메이커" 
        description="내 주식 수익률을 예쁜 카드로 만들어 자랑해보세요!" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            <WordPressLink title="삼성전자 배당금 세금 및 실수령액 계산" url="https://weknews.com/%ec%82%bc%ec%84%b1%ec%a0%84%ec%9e%90-%eb%b0%b0%eb%8b%b9%ea%b8%88-%ec%84%b8%ea%b8%88/" />
            <WordPressLink title="미성년자 해외주식 거래 방법 가이드" url="https://weknews.com/%eb%af%b8%ec%84%b1%eb%85%84%ec%9e%90-%ed%95%b4%ec%99%b8%ec%a3%bc%ec%8b%9d-%ea%b1%b0%eb%9e%98/" />
          </div>
        </section>
      </article>

    </div>
  );
}
