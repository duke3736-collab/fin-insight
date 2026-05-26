"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

const DOMESTIC_BROKERS = [
  { name: "토스증권", rate: 0.015, event: "평생 우대 0.0036%", eventRate: 0.0036396, eventOn: true, color: "blue", url: "https://tossinvest.com" },
  { name: "키움증권", rate: 0.015, event: "신규/휴면 우대 0.0036%", eventRate: 0.0036396, eventOn: true, color: "amber", url: "https://www.kiwoom.com" },
  { name: "카카오페이증권", rate: 0.015, event: null, eventRate: null, eventOn: false, color: "gray", url: "https://www.kakaopaysec.com" },
  { name: "한국투자증권", rate: 0.014, event: "신규 1개월 무료", eventRate: 0.0, eventOn: true, color: "teal", url: "https://securities.koreainvestment.com" },
  { name: "미래에셋증권", rate: 0.014, event: "신규 90일 우대", eventRate: 0.0036396, eventOn: true, color: "gray", url: "https://securities.miraeasset.com" },
  { name: "NH투자증권", rate: 0.014, event: "나무멤버스 0.0043%", eventRate: 0.0043316, eventOn: true, color: "gray", url: "https://www.nhqv.com" },
  { name: "삼성증권", rate: 0.014, event: "ISA 평생 0.0036%", eventRate: 0.0036396, eventOn: true, color: "gray", url: "https://www.samsungpop.com" },
  { name: "신한투자증권", rate: 0.1982, event: "신규/휴면 제로", eventRate: 0.0, eventOn: true, color: "gray", url: "https://www.shinhansec.com" },
  { name: "KB증권", rate: 0.1968, event: "신규 평생 0.0044%", eventRate: 0.0044, eventOn: true, color: "gray", url: "https://www.kbsec.com" },
  { name: "대신증권", rate: 0.014, event: "평생 0.0036%", eventRate: 0.0036, eventOn: true, color: "gray", url: "https://www.daishin.com" }
];

const OVERSEAS_BROKERS = [
  { name: "메리츠증권", rate: 0.07, event: "2026.12까지 무료", eventRate: 0.0, eventOn: true, color: "gray", url: "https://home.imeritz.com" },
  { name: "카카오페이증권", rate: 0.1, event: "우대 0.07%", eventRate: 0.07, eventOn: true, color: "gray", url: "https://www.kakaopaysec.com" },
  { name: "토스증권", rate: 0.1, event: "우대 0.09%", eventRate: 0.09, eventOn: true, color: "blue", url: "https://tossinvest.com" },
  { name: "키움증권", rate: 0.25, event: "신규 우대 0.07%", eventRate: 0.07, eventOn: true, color: "amber", url: "https://www.kiwoom.com" },
  { name: "미래에셋증권", rate: 0.25, event: "신규 90일 무료", eventRate: 0.0, eventOn: true, color: "gray", url: "https://securities.miraeasset.com" },
  { name: "삼성증권", rate: 0.25, event: "신규 3개월 무료", eventRate: 0.0, eventOn: true, color: "gray", url: "https://www.samsungpop.com" },
  { name: "한국투자증권", rate: 0.25, event: "우대 0.09%", eventRate: 0.09, eventOn: true, color: "teal", url: "https://securities.koreainvestment.com" },
  { name: "NH투자증권", rate: 0.25, event: "우대 0.09%", eventRate: 0.09, eventOn: true, color: "gray", url: "https://www.nhqv.com" },
  { name: "KB증권", rate: 0.25, event: "우대 0.07%", eventRate: 0.07, eventOn: true, color: "gray", url: "https://www.kbsec.com" },
  { name: "신한투자증권", rate: 0.25, event: "신규 6개월 0.05%", eventRate: 0.05, eventOn: true, color: "gray", url: "https://www.shinhansec.com" }
];

const colorMap = {
  blue: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  teal: { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/30" },
  gray: { bg: "bg-white/10", text: "text-slate-300", border: "border-white/20" }
};

const OS_EXCHANGE_RATE = 1380;
const OS_SEC_FEE_RATE = 0.0000206;
const OS_CGT_RATE = 0.22;
const OS_CGT_DEDUCTION = 2500000;
const DOMESTIC_MISC_RATE = 0.000036396;
const DOMESTIC_TAX_RATE = 0.0020;

export default function BrokerFeeCalculatorPage() {
  const [tab, setTab] = useState<"domestic" | "overseas">("domestic");
  
  // Domestic States
  const [buyAmountStr, setBuyAmountStr] = useState("10,000,000");
  const [market, setMarket] = useState<"kospi" | "kosdaq">("kospi");
  const [returnRate, setReturnRate] = useState(10);
  const [mode, setMode] = useState<"all" | "broker">("all");
  const [expandedBrokers, setExpandedBrokers] = useState<Record<string, boolean>>({});

  // Overseas States
  const [osBuyAmountStr, setOsBuyAmountStr] = useState("10,000,000");
  const [osCurrencyUSD, setOsCurrencyUSD] = useState(false);
  const [osReturnRate, setOsReturnRate] = useState(10);
  const [osMode, setOsMode] = useState<"all" | "broker">("all");

  // Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString();
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setter("");
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) {
      value = value.replace(/[^\d.]/g, "");
    }
    if (!value.includes('.')) {
        setter(formatNumber(parseInt(value || "0", 10)));
    } else {
        setter(value);
    }
  };

  const toggleExpand = (brokerName: string) => {
    setExpandedBrokers(prev => ({ ...prev, [brokerName]: !prev[brokerName] }));
  };

  const calcDomesticFee = (buy: number, sell: number, rate: number) => {
    const buyBroker = Math.round(buy * (rate / 100));
    const sellBroker = Math.round(sell * (rate / 100));
    const buyMisc = Math.round(buy * DOMESTIC_MISC_RATE);
    const sellMisc = Math.round(sell * DOMESTIC_MISC_RATE);
    const sellTax = Math.round(sell * DOMESTIC_TAX_RATE);
    
    const buyTotal = buyBroker + buyMisc;
    const sellTotal = sellBroker + sellMisc + sellTax;
    return {
      buyBroker, sellBroker, buyMisc, sellMisc, sellTax,
      buyTotal, sellTotal,
      brokerOnly: buyBroker + sellBroker,
      allTotal: buyTotal + sellTotal
    };
  };

  const domesticResults = useMemo(() => {
    const buyAmount = parseFloat(removeCommas(buyAmountStr)) || 0;
    const sellAmount = Math.round(buyAmount * (1 + returnRate / 100));

    const results = DOMESTIC_BROKERS.map(b => {
      const baseDetail = calcDomesticFee(buyAmount, sellAmount, b.rate);
      const useEvent = b.eventOn && b.eventRate !== null;
      const eventDetail = useEvent ? calcDomesticFee(buyAmount, sellAmount, b.eventRate as number) : null;
      const d = eventDetail || baseDetail;
      
      const baseFee = mode === 'broker' ? baseDetail.brokerOnly : baseDetail.allTotal;
      const eventFee = eventDetail ? (mode === 'broker' ? eventDetail.brokerOnly : eventDetail.allTotal) : null;
      const effectiveFee = eventFee !== null ? eventFee : baseFee;
      
      return { ...b, baseDetail, eventDetail, effectiveDetail: d, baseFee, eventFee, effectiveFee, useEvent };
    }).sort((a, b) => a.effectiveFee - b.effectiveFee);

    return { results, buyAmount, sellAmount };
  }, [buyAmountStr, returnRate, mode]);

  const calcOverseasFee = (buyKRW: number, sellKRW: number, rate: number) => {
    const buyBroker = Math.round(buyKRW * (rate / 100));
    const sellBroker = Math.round(sellKRW * (rate / 100));
    const sellSEC = Math.round(sellKRW * OS_SEC_FEE_RATE);
    const profit = sellKRW - buyKRW;
    const taxableProfit = Math.max(0, profit - OS_CGT_DEDUCTION);
    const cgt = Math.round(taxableProfit * OS_CGT_RATE);
    
    const buyTotal = buyBroker;
    const sellTotal = sellBroker + sellSEC;
    return {
      buyBroker, sellBroker, sellSEC, cgt, profit, taxableProfit,
      buyTotal, sellTotal,
      brokerOnly: buyBroker + sellBroker,
      allTotal: buyTotal + sellTotal + cgt
    };
  };

  const overseasResults = useMemo(() => {
    const rawBuy = parseFloat(removeCommas(osBuyAmountStr)) || 0;
    const buyAmountKRW = osCurrencyUSD ? Math.round(rawBuy * OS_EXCHANGE_RATE) : rawBuy;
    const sellAmountKRW = Math.round(buyAmountKRW * (1 + osReturnRate / 100));

    const results = OVERSEAS_BROKERS.map(b => {
      const baseDetail = calcOverseasFee(buyAmountKRW, sellAmountKRW, b.rate);
      const useEvent = b.eventOn && b.eventRate !== null;
      const eventDetail = useEvent ? calcOverseasFee(buyAmountKRW, sellAmountKRW, b.eventRate as number) : null;
      const d = eventDetail || baseDetail;
      
      const baseFee = osMode === 'broker' ? baseDetail.brokerOnly : baseDetail.allTotal;
      const eventFee = eventDetail ? (osMode === 'broker' ? eventDetail.brokerOnly : eventDetail.allTotal) : null;
      const effectiveFee = eventFee !== null ? eventFee : baseFee;
      
      return { ...b, baseDetail, eventDetail, effectiveDetail: d, baseFee, eventFee, effectiveFee, useEvent };
    }).sort((a, b) => a.effectiveFee - b.effectiveFee);

    return { results, buyAmountKRW, sellAmountKRW };
  }, [osBuyAmountStr, osReturnRate, osMode, osCurrencyUSD]);

  const toggleCurrency = () => {
    const raw = parseFloat(removeCommas(osBuyAmountStr)) || 0;
    if (osCurrencyUSD) {
      // USD -> KRW
      setOsBuyAmountStr(formatNumber(Math.round(raw * OS_EXCHANGE_RATE)));
    } else {
      // KRW -> USD
      setOsBuyAmountStr(formatNumber(Math.round(raw / OS_EXCHANGE_RATE)));
    }
    setOsCurrencyUSD(!osCurrencyUSD);
  };

  const renderDomesticCard = (b: any, index: number) => {
    const c = (colorMap as any)[b.color] || colorMap.gray;
    const isOpen = expandedBrokers[b.name] || false;
    const usedRate = b.useEvent ? b.eventRate : b.rate;

    return (
      <div key={b.name} className="bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors rounded-xl p-4 cursor-pointer" onClick={() => toggleExpand(b.name)}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold">{b.name}</span>
            </div>
            {b.useEvent && b.event && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{b.event}</span>
            )}
          </div>
          <div className="text-right">
            {b.useEvent && b.eventFee !== b.baseFee ? (
              <>
                <p className="text-xs text-slate-400 line-through mb-0.5">{formatNumber(b.baseFee)}원</p>
                <p className="text-lg font-black text-rose-400">{formatNumber(b.eventFee)}원</p>
              </>
            ) : (
              <p className="text-lg font-black text-white">{formatNumber(b.effectiveFee)}원</p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5">수수료율 {usedRate}%</p>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[11px] font-bold text-indigo-400 mb-2">매수 비용</p>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>증권사 수수료 ({usedRate}%)</span>
                <span>{formatNumber(b.effectiveDetail.buyBroker)}원</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>유관기관제비용 (0.0036%)</span>
                <span>{formatNumber(b.effectiveDetail.buyMisc)}원</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-700/50">
                <span>매수 소계</span>
                <span>{formatNumber(b.effectiveDetail.buyTotal)}원</span>
              </div>

              <p className="text-[11px] font-bold text-indigo-400 mb-2 mt-3 pt-3 border-t border-slate-800">매도 비용</p>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>증권사 수수료 ({usedRate}%)</span>
                <span>{formatNumber(b.effectiveDetail.sellBroker)}원</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>유관기관제비용 (0.0036%)</span>
                <span>{formatNumber(b.effectiveDetail.sellMisc)}원</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>증권거래세 (0.20%)</span>
                <span>{formatNumber(b.effectiveDetail.sellTax)}원</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-700/50">
                <span>매도 소계</span>
                <span>{formatNumber(b.effectiveDetail.sellTotal)}원</span>
              </div>
            </div>
            {b.url && (
              <a href={b.url} target="_blank" rel="noopener noreferrer" className={`block w-full text-center py-2.5 rounded-lg text-xs font-bold ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}>
                {b.name} 계좌개설 바로가기 →
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOverseasCard = (b: any, index: number) => {
    const c = (colorMap as any)[b.color] || colorMap.gray;
    const isOpen = expandedBrokers[b.name] || false;
    const usedRate = b.useEvent ? b.eventRate : b.rate;

    return (
      <div key={b.name} className="bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors rounded-xl p-4 cursor-pointer" onClick={() => toggleExpand(b.name)}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold">{b.name}</span>
            </div>
            {b.useEvent && b.event && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{b.event}</span>
            )}
          </div>
          <div className="text-right">
            {b.useEvent && b.eventFee !== b.baseFee ? (
              <>
                <p className="text-xs text-slate-400 line-through mb-0.5">{formatNumber(b.baseFee)}원</p>
                <p className="text-lg font-black text-rose-400">{formatNumber(b.eventFee)}원</p>
              </>
            ) : (
              <p className="text-lg font-black text-white">{formatNumber(b.effectiveFee)}원</p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5">수수료율 {usedRate}%</p>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[11px] font-bold text-indigo-400 mb-2">매수 비용 (원화 기준)</p>
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>증권사 수수료 ({usedRate}%)</span>
                <span>{formatNumber(b.effectiveDetail.buyBroker)}원</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-700/50">
                <span>매수 소계</span>
                <span>{formatNumber(b.effectiveDetail.buyTotal)}원</span>
              </div>

              <p className="text-[11px] font-bold text-indigo-400 mb-2 mt-3 pt-3 border-t border-slate-800">매도 비용 (원화 기준)</p>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>증권사 수수료 ({usedRate}%)</span>
                <span>{formatNumber(b.effectiveDetail.sellBroker)}원</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>SEC Fee (0.00206%)</span>
                <span>{formatNumber(b.effectiveDetail.sellSEC)}원</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-700/50">
                <span>매도 소계</span>
                <span>{formatNumber(b.effectiveDetail.sellTotal)}원</span>
              </div>

              <p className="text-[11px] font-bold text-rose-400 mb-2 mt-3 pt-3 border-t border-slate-800">해외 양도소득세</p>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>실현 차익 합산</span>
                <span>{formatNumber(b.effectiveDetail.profit)}원</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-2">
                <span>기본 공제 (연 250만)</span>
                <span>-{formatNumber(Math.min(Math.max(b.effectiveDetail.profit, 0), OS_CGT_DEDUCTION))}원</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-400 pt-1 border-t border-rose-500/30">
                <span>양도소득세 (22%)</span>
                <span>{formatNumber(b.effectiveDetail.cgt)}원</span>
              </div>
            </div>
            {b.url && (
              <a href={b.url} target="_blank" rel="noopener noreferrer" className={`block w-full text-center py-2.5 rounded-lg text-xs font-bold ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}>
                {b.name} 계좌개설 바로가기 →
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">증권사 수수료/세금 비교</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden relative p-6 md:p-10">
        <div className="text-center mb-10 text-slate-200">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4 text-2xl">
            📊
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">증권사 수수료/세금 비교</h1>
          <p className="text-slate-400 text-sm">국내주식/해외주식 증권사별 최적의 거래 수수료 찾기</p>
        </div>

        <div className="flex bg-slate-800/60 p-1 rounded-xl mb-8">
          <button className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${tab === "domestic" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white"}`} onClick={() => setTab("domestic")}>국내주식</button>
          <button className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${tab === "overseas" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white"}`} onClick={() => setTab("overseas")}>해외주식</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-slate-200">
          {tab === "domestic" ? (
            <>
              {/* Domestic Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">매수금액</label>
                  <div className="relative">
                    <input type="text" value={buyAmountStr} onChange={handleCurrencyChange(setBuyAmountStr)} className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 pl-4 pr-12 text-white font-bold outline-none focus:border-indigo-400 text-right" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setBuyAmountStr(formatNumber((parseFloat(removeCommas(buyAmountStr)) || 0) + 1000000))}>+100만</button>
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setBuyAmountStr(formatNumber((parseFloat(removeCommas(buyAmountStr)) || 0) + 5000000))}>+500만</button>
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setBuyAmountStr(formatNumber((parseFloat(removeCommas(buyAmountStr)) || 0) + 10000000))}>+1천만</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">시장 선택</label>
                  <div className="flex gap-2">
                    <button className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-colors ${market === 'kospi' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400'}`} onClick={() => setMarket('kospi')}>코스피 (0.20%)</button>
                    <button className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-colors ${market === 'kosdaq' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400'}`} onClick={() => setMarket('kosdaq')}>코스닥 (0.20%)</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-200">예상 수익률</label>
                    <span className={`font-black text-lg ${returnRate > 0 ? 'text-rose-400' : returnRate < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{returnRate > 0 ? '+' : ''}{returnRate}%</span>
                  </div>
                  <input type="range" min="-100" max="100" value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                    <span>-100%</span><span>0%</span><span>+100%</span>
                  </div>
                </div>
              </div>

              {/* Domestic Results */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="font-bold text-white">증권사별 비교</h2>
                  <div className="flex bg-slate-800/80 p-0.5 rounded-md border border-slate-700">
                    <button className={`px-3 py-1 text-xs font-bold rounded transition-colors ${mode === 'all' ? 'bg-slate-600 text-white' : 'text-slate-400'}`} onClick={() => setMode('all')}>총 비용</button>
                    <button className={`px-3 py-1 text-xs font-bold rounded transition-colors ${mode === 'broker' ? 'bg-slate-600 text-white' : 'text-slate-400'}`} onClick={() => setMode('broker')}>수수료만</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {domesticResults.results.slice(0, 5).map((b, idx) => renderDomesticCard(b, idx))}
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg flex justify-between items-center mt-6">
                  <div>
                    <p className="text-xs font-bold text-white/80 mb-1">연 12회 거래 시 절약 금액</p>
                    <p className="text-2xl font-black">{formatNumber((domesticResults.results[domesticResults.results.length - 1].effectiveFee - domesticResults.results[0].effectiveFee) * 12)}원</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/70">최저 vs 최고 비교</p>
                    <p className="text-xs font-bold mt-1">건당 {formatNumber(domesticResults.results[domesticResults.results.length - 1].effectiveFee - domesticResults.results[0].effectiveFee)}원 차이</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Overseas Inputs */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-200">매수금액 (미국 주식)</label>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-bold" onClick={toggleCurrency}>원화 ↔ USD 전환</button>
                  </div>
                  <div className="relative">
                    <input type="text" value={osBuyAmountStr} onChange={handleCurrencyChange(setOsBuyAmountStr)} className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 pl-4 pr-12 text-white font-bold outline-none focus:border-indigo-400 text-right" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{osCurrencyUSD ? 'USD' : '원'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-right">기준 환율: 1 USD = 1,380원</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setOsBuyAmountStr(formatNumber((parseFloat(removeCommas(osBuyAmountStr)) || 0) + (osCurrencyUSD ? 1000 : 1000000)))}>+{osCurrencyUSD ? '1천불' : '100만'}</button>
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setOsBuyAmountStr(formatNumber((parseFloat(removeCommas(osBuyAmountStr)) || 0) + (osCurrencyUSD ? 5000 : 5000000)))}>+{osCurrencyUSD ? '5천불' : '500만'}</button>
                    <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setOsBuyAmountStr(formatNumber((parseFloat(removeCommas(osBuyAmountStr)) || 0) + (osCurrencyUSD ? 10000 : 10000000)))}>+{osCurrencyUSD ? '1만불' : '1천만'}</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-200">예상 수익률</label>
                    <span className={`font-black text-lg ${osReturnRate > 0 ? 'text-rose-400' : osReturnRate < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{osReturnRate > 0 ? '+' : ''}{osReturnRate}%</span>
                  </div>
                  <input type="range" min="-100" max="100" value={osReturnRate} onChange={e => setOsReturnRate(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                    <span>-100%</span><span>0%</span><span>+100%</span>
                  </div>
                </div>
              </div>

              {/* Overseas Results */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="font-bold text-white">증권사별 비교</h2>
                  <div className="flex bg-slate-800/80 p-0.5 rounded-md border border-slate-700">
                    <button className={`px-3 py-1 text-xs font-bold rounded transition-colors ${osMode === 'all' ? 'bg-slate-600 text-white' : 'text-slate-400'}`} onClick={() => setOsMode('all')}>총 비용</button>
                    <button className={`px-3 py-1 text-xs font-bold rounded transition-colors ${osMode === 'broker' ? 'bg-slate-600 text-white' : 'text-slate-400'}`} onClick={() => setOsMode('broker')}>수수료만</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {overseasResults.results.slice(0, 5).map((b, idx) => renderOverseasCard(b, idx))}
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg flex justify-between items-center mt-6">
                  <div>
                    <p className="text-xs font-bold text-white/80 mb-1">연 12회 거래 시 절약 금액</p>
                    <p className="text-2xl font-black">{formatNumber((overseasResults.results[overseasResults.results.length - 1].effectiveFee - overseasResults.results[0].effectiveFee) * 12)}원</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/70">최저 vs 최고 비교</p>
                    <p className="text-xs font-bold mt-1">건당 {formatNumber(overseasResults.results[overseasResults.results.length - 1].effectiveFee - overseasResults.results[0].effectiveFee)}원 차이</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
           <ShareButtons 
             title="증권사 수수료/세금 비교 계산기" 
             description="내 투자 성향에 맞는 최적의 증권사를 찾아보세요!" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">💡 증권거래세와 유관기관제비용</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            국내 주식을 거래할 때는 증권사 수수료 외에도 국가에 내는 <strong>증권거래세</strong>와 한국거래소 등에 내는 <strong>유관기관제비용</strong>이 발생합니다.
            현재 코스피/코스닥 모두 매도 시 0.20%의 거래세가 부과되며, 유관기관제비용은 매수/매도 양쪽에 약 0.0036%씩 부과됩니다. 증권사 평생 우대 이벤트가 "0.0036%"로 표시되는 것은 순수 증권사 수수료는 0원이지만, 이 유관기관제비용만을 고객이 부담한다는 의미입니다.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">🌎 해외주식 양도소득세 250만 원 공제</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            해외주식은 매년 1월 1일부터 12월 31일까지 발생한 실현수익(매도하여 확정된 수익)에서 실현손실을 뺀 순수익을 기준으로 양도소득세를 부과합니다.
            이때 기본적으로 <strong>250만 원을 공제</strong>해 주며, 그 250만 원을 초과하는 금액에 대해서만 지방소득세를 포함하여 <strong>22%의 세금</strong>이 부과됩니다. 
            따라서 연말에 손실 난 종목을 매도하여 수익금을 250만 원 이하로 맞추는 절세 전략이 매우 중요합니다.
          </p>
        
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            <WordPressLink title="부동산 중개수수료 반값으로 깎는 협상 기술 실전편" url="https://weknews.com/broker-fee-negotiation" />
            <WordPressLink title="전월세 계약 전 반드시 확인해야 할 특약사항 5가지" url="https://weknews.com/real-estate-contract-tips" />
          </div>
        </section>
      </article>
    </div>
  );
}
