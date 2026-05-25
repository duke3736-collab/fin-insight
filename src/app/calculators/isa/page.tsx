"use client";

import { useState } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

export default function IsaCalculatorPage() {
  const [currentType, setCurrentType] = useState<"normal" | "seomin">("normal");
  const [principalStr, setPrincipalStr] = useState<string>("");
  const [profitStr, setProfitStr] = useState<string>("");
  const [isPensionChecked, setIsPensionChecked] = useState<boolean>(false);

  // Formatter functions
  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setPrincipalStr("");
      return;
    }
    if (!/^\d+$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    setPrincipalStr(formatNumber(parseInt(value || "0", 10)));
  };

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setProfitStr("");
      return;
    }
    if (!/^\d+$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    setProfitStr(formatNumber(parseInt(value || "0", 10)));
  };

  // Calculations
  const principal = principalStr ? parseInt(removeCommas(principalStr), 10) : 0;
  const profit = profitStr ? parseInt(removeCommas(profitStr), 10) : 0;

  // 1. Normal Tax (15.4%)
  const normalTax = Math.floor(profit * 0.154);

  // 2. ISA Tax
  const taxFreeLimit = currentType === "seomin" ? 10000000 : 5000000;
  let isaTax = 0;
  if (profit > taxFreeLimit) {
    isaTax = Math.floor((profit - taxFreeLimit) * 0.099);
  }

  // 3. Pension Credit
  let pensionCredit = 0;
  if (isPensionChecked) {
    const totalTransfer = principal + profit;
    const creditBase = Math.min(totalTransfer * 0.1, 3000000);
    pensionCredit = Math.floor(creditBase * 0.132);
  }

  // 4. Total Saved
  const totalSaved = normalTax - isaTax + pensionCredit;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">ISA 절세 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Calculator Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                🛡️ 절세 전략 (2026 개정안)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
              ISA 실전 절세 계산기
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              중개형 ISA 비과세 혜택과 연금저축 전환 세액공제까지 1초 만에 확인하세요.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">ISA 계좌 유형 (2026 기준)</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCurrentType("normal")} 
                  className={`p-4 rounded-xl border-2 text-left transition-all ${currentType === 'normal' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="font-bold text-slate-800">일반형</div>
                  <div className="text-[12px] text-slate-500 mt-1">비과세 500만 원</div>
                </button>
                <button 
                  onClick={() => setCurrentType("seomin")} 
                  className={`p-4 rounded-xl border-2 text-left transition-all ${currentType === 'seomin' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="font-bold text-slate-800">서민형</div>
                  <div className="text-[12px] text-slate-500 mt-1">비과세 1,000만 원 (급여 5천만↓)</div>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  💰 누적 납입 원금
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={principalStr}
                    onChange={handlePrincipalChange}
                    placeholder="예: 30,000,000" 
                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-xl font-extrabold text-slate-900 text-right outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">원</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">* 연금 전환 추가 공제를 정확하게 계산하기 위해 입력합니다.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  📈 ISA 계좌 내 순이익 (손익통산 후)
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profitStr}
                    onChange={handleProfitChange}
                    placeholder="예: 15,000,000" 
                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-xl font-extrabold text-slate-900 text-right outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">원</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">* 주식·ETF·배당 등 계좌 내 전체 이익에서 손실을 뺀 순수익</p>
              </div>
            </div>

            {/* Options */}
            <div className="p-4 rounded-xl border bg-slate-50/50 border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPensionChecked}
                  onChange={(e) => setIsPensionChecked(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700 cursor-pointer">만기 후 연금저축/IRP 전환 (추가 세액공제)</span>
              </label>
              {isPensionChecked && (
                <div className="mt-3 text-[11.5px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  전환 금액(원금+수익)의 10% (최대 300만 원)에 대해 13.2% 세액공제가 추가 적용됩니다.
                </div>
              )}
            </div>

          </div>

          {/* Results */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">비교 결과</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">일반 계좌 세금 (15.4%)</span>
                <span className="font-bold text-slate-800 line-through decoration-red-400/50">{formatNumber(normalTax)}원</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-sm text-emerald-700 font-bold">ISA 적용 세금 (비과세+9.9%)</span>
                <span className="font-bold text-emerald-700">{formatNumber(isaTax)}원</span>
              </div>

              {isPensionChecked && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <span className="text-sm text-blue-700 font-bold">연금 전환 세액공제 혜택</span>
                  <span className="font-bold text-blue-700">- {formatNumber(pensionCredit)}원</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col items-center justify-center text-center relative z-10">
                <span className="text-sm font-bold text-slate-300 mb-2">아낄 수 있는 총 세금 (최종 절세액)</span>
                <span className="text-4xl font-black text-emerald-400">{formatNumber(totalSaved)}원</span>
              </div>
            </div>

            <KakaoShareButton 
              title="ISA 실전 절세 계산기" 
              description={`ISA 계좌 활용 시 예상 절세액은 ${formatNumber(totalSaved)}원 입니다!`} 
              kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
            />
          </div>

        </div>
      </div>
      
      {/* Monetization / SEO Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
        <h4 className="font-bold text-blue-800 mb-2">💡 Tip: ISA 계좌 개설 전 꼭 확인하세요!</h4>
        <p className="text-sm text-blue-700 mb-4">현재 각 증권사에서 수수료 평생 우대 및 현금 지급 이벤트를 진행하고 있습니다. 나에게 가장 유리한 증권사를 비교해 보세요.</p>
        <a href="#" className="inline-block text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors">
          증권사별 ISA 혜택 비교하기 →
        </a>
      </div>

      {/* SEO Content Section for AdSense Approval */}
      <article className="max-w-none space-y-10 pb-12 mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">중개형 ISA란 무엇인가요? (개인종합자산관리계좌)</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide">
            <strong>중개형 ISA (Individual Savings Account)</strong>는 하나의 계좌 안에서 주식, ETF, 펀드, 채권 등 다양한 금융 상품에 투자하면서 세제 혜택을 받을 수 있는 '만능 통장'입니다. 
            일반적인 주식 계좌에서 배당금이나 이자가 발생하면 15.4%의 세금을 내야 하지만, ISA 계좌를 활용하면 일정 금액까지 세금을 한 푼도 내지 않는 <strong>비과세 혜택</strong>을 받을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">2026년 ISA 세제개편안의 핵심 포인트</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide mb-5">
            정부의 금융투자소득세(금투세) 폐지 추진과 함께 ISA 계좌의 혜택이 대폭 상향될 예정입니다. 이 계산기는 다가오는 2026년 개정안을 기준으로 작동합니다.
          </p>
          <ul className="list-disc pl-6 text-slate-800 text-[15px] md:text-base space-y-3 font-medium bg-slate-50 p-6 rounded-xl border border-slate-100">
            <li><strong>납입 한도 증가:</strong> 연간 2,000만 원(총 1억 원)에서 <strong className="text-emerald-700">연간 4,000만 원(총 2억 원)</strong>으로 대폭 상향됩니다.</li>
            <li><strong>일반형 비과세 한도:</strong> 기존 200만 원에서 <strong className="text-emerald-700">500만 원</strong>으로 상향됩니다.</li>
            <li><strong>서민형 비과세 한도:</strong> 기존 400만 원에서 <strong className="text-emerald-700">1,000만 원</strong>으로 상향됩니다. (근로소득 5,000만 원 또는 종합소득 3,800만 원 이하 가입자)</li>
            <li><strong>초과분 저율과세:</strong> 비과세 한도를 초과하는 수익에 대해서는 기존 15.4%가 아닌 <strong className="text-emerald-700">9.9%의 낮은 세율(분리과세)</strong>이 적용됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">만기 후 연금저축/IRP 전환 시 혜택 (추가 세액공제)</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide">
            ISA 계좌의 의무 가입 기간은 3년입니다. 3년 후 만기가 되었을 때, 자금을 인출하지 않고 <strong>연금저축이나 IRP 계좌로 전환(이체)</strong>하면 엄청난 절세 효과를 추가로 누릴 수 있습니다.
            <br/><br/>
            전환하는 금액의 10% (최대 300만 원 한도)에 대해 연말정산 시 추가 세액공제를 받을 수 있습니다. 총 급여 5,500만 원 이하인 경우 16.5%, 초과인 경우 13.2%의 세액공제율이 적용되어 <strong className="text-blue-700 bg-blue-50 px-1">최대 39.6만 원에서 49.5만 원의 세금을 돌려받게 됩니다.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">자주 묻는 질문 (FAQ)</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 mb-2"><span className="text-emerald-500">Q.</span> 주식 매매차익도 비과세 한도에 포함되나요?</h3>
              <p className="text-slate-700 text-base leading-relaxed pl-7">현재 국내 주식의 매매차익은 원래 비과세이므로 ISA 계좌의 비과세 한도(500/1000만 원)를 깎아먹지 않습니다. 주로 배당금, 이자, 해외 주식형 ETF의 매매차익 등이 비과세 혜택의 대상이 됩니다.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 mb-2"><span className="text-emerald-500">Q.</span> 손익통산이란 무엇인가요?</h3>
              <p className="text-slate-700 text-base leading-relaxed pl-7">계좌 내에서 이익이 난 상품과 손실이 난 상품의 수익을 합산하여 순이익에만 세금을 매기는 것을 말합니다. 예를 들어 A종목에서 500만 원 이익, B종목에서 200만 원 손실이 났다면, 일반 계좌는 500만 원에 대해 세금을 내야 하지만 ISA는 순이익 300만 원에 대해서만 세금을 계산합니다.</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
