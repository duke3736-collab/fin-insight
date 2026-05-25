"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

const API_URL = 'https://api.gold-api.com/price/XAU/KRW';
const TROY_OUNCE_TO_GRAM = 31.1034768;

export default function GoldPricePage() {
  const [priceOz, setPriceOz] = useState<number | null>(null);
  const [priceGram, setPriceGram] = useState<number | null>(null);
  const [priceDon, setPriceDon] = useState<number | null>(null);
  const [updateTime, setUpdateTime] = useState<string>("데이터 불러오는 중...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const formatCurrency = (num: number | null) => {
    if (num === null) return "000,000";
    return Math.round(num).toLocaleString('ko-KR');
  };

  const fetchGoldPrice = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const fetchedPriceOz = data.price;
      const fetchedPriceGram = fetchedPriceOz / TROY_OUNCE_TO_GRAM;
      const fetchedPriceDon = fetchedPriceGram * 3.75;

      setPriceOz(fetchedPriceOz);
      setPriceGram(fetchedPriceGram);
      setPriceDon(fetchedPriceDon);
      
      const now = new Date();
      setUpdateTime(`기준 시각: ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
      
    } catch (error) {
      console.error('Failed to fetch gold price:', error);
      setIsError(true);
      // Fallback mock data
      const mockPriceOz = 3350000;
      const mockPriceGram = mockPriceOz / TROY_OUNCE_TO_GRAM;
      const mockPriceDon = mockPriceGram * 3.75;

      setPriceOz(mockPriceOz);
      setPriceGram(mockPriceGram);
      setPriceDon(mockPriceDon);
      
      setUpdateTime('API 지연 (최근 평균가 기준)');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoldPrice();
    const intervalId = setInterval(fetchGoldPrice, 60000);
    return () => clearInterval(intervalId);
  }, [fetchGoldPrice]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">실시간 금시세</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Gold Widget Container */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-xl border border-yellow-500/20 text-slate-100 p-8 md:p-10">
        
        {/* Subtle glowing orb in background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-br from-yellow-200 to-amber-500 bg-clip-text text-transparent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gold-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              실시간 금시세
            </h1>
            <button 
              onClick={fetchGoldPrice}
              title="새로고침"
              disabled={isLoading}
              className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ${isLoading ? 'animate-spin opacity-50' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>

          <div className="text-center mb-10 relative">
            <div className="text-sm font-semibold text-slate-400 mb-2 tracking-wider">살 때 기준 (1돈 / 3.75g)</div>
            <div className="text-5xl md:text-6xl font-black mb-2 flex justify-center items-end gap-2 drop-shadow-lg">
              <span className={`${isLoading ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 bg-[length:200%_100%] animate-pulse' : 'text-white'}`}>
                {formatCurrency(priceDon)}
              </span>
              <span className="text-2xl font-bold text-amber-400 mb-1">KRW</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1 hover:border-amber-500/30">
              <div className="text-xs text-slate-400 mb-1">1g 당 가격</div>
              <div className={`text-xl md:text-2xl font-bold ${isLoading ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 bg-[length:200%_100%] animate-pulse' : 'text-slate-100'}`}>
                {formatCurrency(priceGram)}
              </div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 text-center transition-transform hover:-translate-y-1 hover:border-amber-500/30">
              <div className="text-xs text-slate-400 mb-1">국제 시세 (1oz)</div>
              <div className={`text-xl md:text-2xl font-bold ${isLoading ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 bg-[length:200%_100%] animate-pulse' : 'text-slate-100'}`}>
                {formatCurrency(priceOz)}
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            {!isLoading && (
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isError ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isError ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
            )}
            <span className={isError ? "text-amber-400" : ""}>{updateTime}</span>
          </div>
        </div>
      </div>
      
      <KakaoShareButton 
        title="실시간 금시세" 
        description="현재 1돈, 1g 당 금 가격을 실시간으로 확인해 보세요!" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />

    </div>
  );
}
