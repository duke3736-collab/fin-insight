"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";

export default function GrowthFundCalculatorPage() {
  const [amountStr, setAmountStr] = useState("10,000,000");
  const [accountType, setAccountType] = useState<"general" | "isa">("general");
  const [rate, setRate] = useState(15);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString();
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setAmountStr("");
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) {
      value = value.replace(/[^\d.]/g, "");
    }
    const num = parseInt(value, 10);
    if (num > 10000000000) {
      setAmountStr(formatNumber(10000000000));
    } else {
      setAmountStr(formatNumber(num || 0));
    }
  };

  const addAmount = (val: number) => {
    const current = parseInt(removeCommas(amountStr), 10) || 0;
    const next = Math.min(current + val, 10000000000);
    setAmountStr(formatNumber(next));
  };

  const resetAmount = () => setAmountStr(formatNumber(10000000));

  const result = useMemo(() => {
    const principal = parseInt(removeCommas(amountStr), 10) || 0;
    const isIsa = accountType === "isa";
    
    let grossProfit = 0;
    let tax = 0;
    let finalAmount = principal;
    let badgeType: "none" | "safe" | "loss" = "none";
    let badgeMessage = "";
    
    if (rate > 0) {
      grossProfit = principal * (rate / 100);
      if (!isIsa) {
        tax = grossProfit * 0.154;
      }
      finalAmount = principal + grossProfit - tax;
    } else if (rate < 0) {
      const fundLossPercent = Math.abs(rate);
      const fundLossAmount = principal * (fundLossPercent / 100);
      grossProfit = -fundLossAmount;
      
      if (fundLossPercent <= 20) {
        finalAmount = principal; // Fully protected
        badgeType = "safe";
        badgeMessage = `🛡️ 정부가 손실액 전액(${formatNumber(fundLossAmount)}원)을 방어하여 내 원금은 100% 안전하게 보호되었습니다!`;
      } else {
        const myLossPercent = fundLossPercent - 20;
        const myLoss = principal * (myLossPercent / 100);
        const govDefense = principal * 0.20;
        finalAmount = principal - myLoss;
        badgeType = "loss";
        badgeMessage = `⚠️ 정부가 최대치인 20%(${formatNumber(govDefense)}원)를 방어했지만, 초과 손실분(-${myLossPercent}%)이 내 원금에서 차감되었습니다.`;
      }
    }
    
    return { principal, grossProfit, tax, finalAmount, badgeType, badgeMessage };
  }, [amountStr, accountType, rate]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">국민성장펀드 수익률 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden relative p-6 md:p-10 text-slate-200">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg mb-4 text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">국민성장펀드 수익률 계산기</h1>
          <p className="text-emerald-400 font-medium text-sm">정부의 '20% 손실 방어' 효과를 직접 확인하세요</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">투자 금액</label>
            <div className="relative mb-3">
              <input 
                type="text" 
                value={amountStr} 
                onChange={handleAmountChange} 
                className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-4 pl-5 pr-14 text-white text-lg font-bold outline-none focus:border-emerald-400 text-right transition-colors" 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => addAmount(1000000)}>+100만</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => addAmount(5000000)}>+500만</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => addAmount(10000000)}>+1천만</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400" onClick={resetAmount}>초기화</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer">
              <input type="radio" className="peer sr-only" name="accountType" value="general" checked={accountType === 'general'} onChange={() => setAccountType('general')} />
              <div className="p-4 border-2 border-slate-700 rounded-xl peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all text-center">
                <div className="font-bold text-white mb-1">일반 계좌</div>
                <div className="text-xs text-slate-400">15.4% 배당소득세 과세</div>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" className="peer sr-only" name="accountType" value="isa" checked={accountType === 'isa'} onChange={() => setAccountType('isa')} />
              <div className="p-4 border-2 border-slate-700 rounded-xl peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 transition-all text-center">
                <div className="font-bold text-white mb-1">ISA / 비과세</div>
                <div className="text-xs text-slate-400">세금 0원 (수익 전액 수령)</div>
              </div>
            </label>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-200">예상 펀드 수익률 (가정)</label>
              <span className={`font-black text-2xl ${rate > 0 ? 'text-blue-400' : rate < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {rate > 0 ? '+' : ''}{rate}%
              </span>
            </div>
            <input 
              type="range" 
              min="-50" 
              max="100" 
              value={rate} 
              onChange={e => setRate(Number(e.target.value))} 
              className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-3 px-1">
              <span>-50%</span>
              <span className="text-emerald-500/80">-20% (방어선)</span>
              <span>0%</span>
              <span>+50%</span>
              <span>+100%</span>
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-slate-400 mb-2">예상 최종 수령액</div>
              <div className={`text-4xl md:text-5xl font-black tracking-tight ${rate > 0 ? 'text-blue-400' : rate < 0 && result.badgeType === 'loss' ? 'text-rose-400' : rate < 0 && result.badgeType === 'safe' ? 'text-emerald-400' : 'text-white'}`}>
                {formatNumber(result.finalAmount)}원
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-700/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">내 원금</span>
                <span className="text-white font-bold">{formatNumber(result.principal)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">{rate < 0 ? '펀드 평가 손실' : rate > 0 ? '펀드 수익금' : '펀드 총 손익'}</span>
                <span className={`font-bold ${rate > 0 ? 'text-blue-400' : rate < 0 ? 'text-rose-400' : 'text-white'}`}>
                  {rate > 0 ? '+' : ''}{formatNumber(result.grossProfit)}원
                </span>
              </div>
              {result.tax > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">세금 (15.4%)</span>
                  <span className="text-rose-400 font-bold">-{formatNumber(result.tax)}원</span>
                </div>
              )}
            </div>

            {result.badgeType !== "none" && (
              <div className={`mt-6 p-4 rounded-xl text-sm font-bold text-center border leading-relaxed ${result.badgeType === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                {result.badgeMessage.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
           <ShareButtons 
             title="국민성장펀드 수익률 & 손실방어 계산기" 
             description="정부의 20% 손실 방어 효과를 직접 시뮬레이션 해보세요!" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">🛡️ 국민성장펀드의 '손실 20% 방어'란?</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            국민성장펀드는 민간 투자자들의 자금을 보호하기 위해 정부(재정)가 <strong>후순위 출자자</strong>로 참여하는 특수한 구조로 설계되었습니다.
            만약 펀드 운용 결과 손실이 발생할 경우, 전체 손실액의 최대 20%까지는 정부가 먼저 손실을 떠안게 됩니다.
            따라서 <strong>손실률이 20% 이하일 경우에는 개인 투자자의 원금은 100% 안전하게 보호</strong>되며, 손실률이 20%를 초과할 때만 초과분만큼 원금에서 손실이 발생합니다.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">📈 일반 계좌와 ISA 계좌의 세금 차이</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            펀드에서 수익이 났을 때, <strong>일반 계좌</strong>를 이용하면 수익금에 대해 15.4%의 배당소득세가 원천징수됩니다.
            하지만 <strong>ISA(개인종합자산관리계좌)</strong>를 통해 투자하면 발생한 수익에 대해 비과세(또는 분리과세) 혜택을 받을 수 있어 절세 효과를 극대화할 수 있습니다. 
            위 계산기에서 계좌 유형을 변경하여 실질적으로 수령하는 최종 금액의 차이를 확인해 보세요.
          </p>
        </section>
      </article>
    </div>
  );
}
