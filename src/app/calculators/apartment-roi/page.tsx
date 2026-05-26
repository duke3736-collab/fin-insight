"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";

export default function ApartmentROICalculatorPage() {
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [ownCapital, setOwnCapital] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rentalIncome, setRentalIncome] = useState("");
  const [transferCost, setTransferCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [brokerFeeSell, setBrokerFeeSell] = useState("");

  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") { setter(""); return; }
    value = value.replace(/[^\d]/g, "");
    const num = parseInt(value, 10);
    setter(formatNumber(num || 0));
  };

  const numberToKorean = (num: number) => {
    if (!num || num === 0) return '';
    let result = '';
    
    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        result += `${eok.toLocaleString()}억 `;
        if (man > 0) result += `${man.toLocaleString()}만 `;
    } else if (num >= 10000) {
        const man = Math.floor(num / 10000);
        result += `${man.toLocaleString()}만 `;
    } else {
        return `${num.toLocaleString()}원`;
    }
    
    return result.trim() + '원';
  };

  const getNumVal = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const result = useMemo(() => {
    const buy = getNumVal(buyPrice);
    const sell = getNumVal(sellPrice);
    const cap = getNumVal(ownCapital);
    const dep = getNumVal(deposit);
    const rental = getNumVal(rentalIncome);
    const transfer = getNumVal(transferCost);
    const other = getNumVal(otherCost);
    const broker = getNumVal(brokerFeeSell);

    const initialInvestment = cap + transfer;
    const totalCost = transfer + other;
    const totalInvestment = cap + totalCost - dep;
    
    const preTaxProfit = sell - buy - broker - totalCost + rental;

    let roi = 0;
    if (totalInvestment > 0) {
        roi = (preTaxProfit / totalInvestment) * 100;
    }

    return {
      initialInvestment,
      totalInvestment,
      preTaxProfit,
      roi
    };
  }, [buyPrice, sellPrice, ownCapital, deposit, rentalIncome, transferCost, otherCost, brokerFeeSell]);

  const renderInputGroup = (label: string, value: string, setter: (val: string) => void, tooltip?: string) => {
    const num = getNumVal(value);
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="inline-flex justify-center items-center w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] cursor-help" title={tooltip}>?</span>
          )}
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={value} 
            onChange={handleCurrencyChange(setter)} 
            placeholder="0"
            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 pl-4 pr-12 text-white font-bold outline-none focus:border-indigo-400 transition-colors text-right" 
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">원</span>
        </div>
        <div className="text-xs text-indigo-400 text-right min-h-[16px] font-bold">
          {numberToKorean(num)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <Link href="/#investment" className="hover:text-slate-800">투자 계산기</Link>
        <span>›</span>
        <span className="text-slate-800">아파트 투자 수익률 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden p-6 md:p-10 text-slate-200">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg mb-4 text-2xl">
            📈
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">아파트 투자 수익률 계산기</h1>
          <p className="text-indigo-400 font-medium text-sm">매매가와 부대비용을 입력해 정확한 투자 수익(ROI)을 확인하세요</p>
        </div>

        <div className="space-y-8">
          
          {/* Section 1: 기본 정보 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-indigo-500/30 pb-3">
              <span>🏠 기본 정보 (매매)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputGroup("매입가", buyPrice, setBuyPrice)}
              {renderInputGroup("목표 매도가", sellPrice, setSellPrice)}
            </div>
          </div>

          {/* Section 2: 자금 계획 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-emerald-500/30 pb-3">
              <span>💰 자금 계획 (임대/자본)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderInputGroup("자납금 (내 자본금)", ownCapital, setOwnCapital)}
              {renderInputGroup("보증금 (전/월세)", deposit, setDeposit)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputGroup("총 임대수익 (누적 월세 등)", rentalIncome, setRentalIncome)}
            </div>
          </div>

          {/* Section 3: 부대 비용 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-rose-500/30 pb-3">
              <span>📉 부대 비용</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderInputGroup("총 이전비용", transferCost, setTransferCost, "취득세, 등기비용, 매수 중개수수료 등")}
              {renderInputGroup("기타 비용", otherCost, setOtherCost, "수리비, 인테리어, 대출 이자 등")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputGroup("중개수수료 (매도시)", brokerFeeSell, setBrokerFeeSell)}
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-black/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden mt-8">
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-400 font-bold">초기 투자금 <span className="text-xs font-normal text-slate-500 ml-1">(자본금 + 이전비용)</span></span>
                <span className="text-white font-bold">{formatNumber(result.initialInvestment)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-400 font-bold">총 투자금 <span className="text-xs font-normal text-slate-500 ml-1">(자본금 + 총비용 - 보증금)</span></span>
                <span className="text-white font-bold">{formatNumber(result.totalInvestment)}원</span>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-300 font-bold">세전 수익금</span>
                <span className={`text-xl md:text-2xl font-black ${result.preTaxProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.preTaxProfit > 0 ? '+' : ''}{formatNumber(result.preTaxProfit)}원
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-indigo-400 font-bold text-lg">투자 수익률 (ROI)</span>
                <span className={`text-3xl md:text-4xl font-black tracking-tight ${result.roi < 0 ? 'text-rose-400' : 'text-indigo-400'}`}>
                  {result.roi > 0 ? '+' : ''}{result.roi.toFixed(2)}%
                </span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="mt-8">
           <ShareButtons 
             title="아파트 투자 수익률 계산기" 
             description="매매가, 부대비용, 임대수익을 종합한 내 진짜 투자 수익률은 얼마일까?" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

    </div>
  );
}
