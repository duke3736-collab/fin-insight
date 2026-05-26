"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

export default function RealEstateTaxCalculatorPage() {
  const [propertyType, setPropertyType] = useState<"residential" | "commercial" | "land" | "farm">("residential");
  const [priceStr, setPriceStr] = useState("500,000,000");
  const [houseCount, setHouseCount] = useState<1 | 2 | 3 | 4>(1);
  const [isAdj, setIsAdj] = useState(false);
  const [area, setArea] = useState(84);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setPriceStr("");
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) {
      value = value.replace(/[^\d.]/g, "");
    }
    const num = parseInt(value, 10);
    if (num > 100000000000) {
      setPriceStr(formatNumber(100000000000));
    } else {
      setPriceStr(formatNumber(num || 0));
    }
  };

  const setQuickPrice = (val: number) => setPriceStr(formatNumber(val));

  const result = useMemo(() => {
    const price = parseInt(removeCommas(priceStr), 10) || 0;
    
    let acqR = 0, eR = 0, fR = 0;
    let sumTxt = "";
    let risk: "normal" | "warning" | "danger" = "normal";
    
    if (price === 0) {
      return { price, acqR, eR, fR, acqTax: 0, eduTax: 0, farmTax: 0, totalTax: 0, sumTxt: "취득 정보를 입력해주세요.", risk, totalR: 0 };
    }

    if (propertyType === "residential") {
      // Acquisition Rate
      if (houseCount === 1) {
        if (price <= 600000000) acqR = 1;
        else if (price <= 900000000) acqR = Math.round(((price - 600000000) / 150000000 + 1) * 100) / 100;
        else acqR = 3;
      } else if (houseCount === 2) {
        if (isAdj) acqR = 8;
        else {
          if (price <= 600000000) acqR = 1;
          else if (price <= 900000000) acqR = Math.round(((price - 600000000) / 150000000 + 1) * 100) / 100;
          else acqR = 3;
        }
      } else if (houseCount === 3) {
        if (isAdj) acqR = 12;
        else acqR = 8;
      } else {
        acqR = 12;
      }

      // Education Rate
      eR = acqR >= 8 ? 0.4 : Math.round(acqR * 0.1 * 10) / 10;

      // Farm Rate
      if (area <= 85) fR = 0;
      else {
        if (acqR >= 12) fR = 1.0;
        else if (acqR >= 8) fR = 0.6;
        else fR = 0.2;
      }

      // Summary Text
      if (houseCount === 1) sumTxt = `1주택 기본세율(${acqR.toFixed(2)}%) 적용`;
      else if (houseCount === 2 && isAdj) { sumTxt = `조정지역 2주택 — 중과세율 8% 적용`; risk = "warning"; }
      else if (houseCount === 2) { sumTxt = `비조정 2주택 — 일반세율(${acqR.toFixed(2)}%) 적용`; }
      else if (houseCount === 3 && isAdj) { sumTxt = `조정지역 3주택 — 중과세율 12% 적용. 세무사 상담 권장`; risk = "danger"; }
      else if (houseCount === 3) { sumTxt = `비조정 3주택 — 중과세율 8% 적용`; risk = "warning"; }
      else { sumTxt = `4주택 이상/법인 — 중과세율 12% 적용`; risk = "danger"; }
      
      sumTxt += area > 85 ? ` | 전용${area}㎡ 농특세 ${fR.toFixed(1)}% 부과` : ` | 전용${area}㎡ — 농특세 비과세`;

    } else if (propertyType === "commercial") {
      acqR = 4; eR = 0.4; fR = 0.2;
      sumTxt = "상가/오피스텔 일반 취득세율(4%) — 총 4.6%";
    } else if (propertyType === "land") {
      acqR = 4; eR = 0.4; fR = 0.2;
      sumTxt = "토지 일반 취득세율(4%) — 총 4.6%";
    } else if (propertyType === "farm") {
      acqR = 2; eR = 0.2; fR = 0.1;
      sumTxt = "농지 취득세율(2%) | 8년 자경 시 50% 감면 신청 가능";
    }

    const acqTax = price * (acqR / 100);
    const eduTax = price * (eR / 100);
    const farmTax = price * (fR / 100);
    const totalTax = acqTax + eduTax + farmTax;
    const totalR = acqR + eR + fR;

    return { price, acqR, eR, fR, acqTax, eduTax, farmTax, totalTax, sumTxt, risk, totalR };
  }, [priceStr, propertyType, houseCount, isAdj, area]);

  const typeLabels = { residential: "주택", commercial: "상가", land: "토지", farm: "농지" };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">부동산 취득세 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" className="!bg-slate-900 !border-slate-800" />

      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden p-6 md:p-10 text-slate-200">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg mb-4 text-2xl">
            🏠
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">부동산 취득세 계산기</h1>
          <p className="text-indigo-400 font-medium text-sm">주택 수 · 조정대상지역 · 전용면적 모두 반영한 정확한 세액 산출</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-3">부동산 종류</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button 
                onClick={() => setPropertyType("residential")} 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${propertyType === 'residential' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
              >
                <span className="text-xl">🏠</span>
                <span className="text-xs">주택/아파트</span>
              </button>
              <button 
                onClick={() => setPropertyType("commercial")} 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${propertyType === 'commercial' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
              >
                <span className="text-xl">🏢</span>
                <span className="text-xs">상가/오피스텔</span>
              </button>
              <button 
                onClick={() => setPropertyType("land")} 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${propertyType === 'land' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
              >
                <span className="text-xl">🏞️</span>
                <span className="text-xs">토지</span>
              </button>
              <button 
                onClick={() => setPropertyType("farm")} 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${propertyType === 'farm' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
              >
                <span className="text-xl">🚜</span>
                <span className="text-xs">농지</span>
              </button>
            </div>
            {propertyType === "residential" && (
              <p className="text-xs text-slate-500 mt-2">🏠 아파트, 단독주택, 연립·다세대, 빌라 모두 동일 주택 세율 적용</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">취득가액 (매매가)</label>
            <div className="relative mb-3">
              <input 
                type="text" 
                value={priceStr} 
                onChange={handlePriceChange} 
                className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-4 pl-5 pr-14 text-white text-lg font-bold outline-none focus:border-indigo-400 text-right transition-colors" 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickPrice(300000000)}>3억</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickPrice(500000000)}>5억</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickPrice(600000000)}>6억</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickPrice(900000000)}>9억</button>
              <button className="flex-1 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setQuickPrice(1500000000)}>15억</button>
            </div>
          </div>

          {propertyType === "residential" && (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <span className="h-px bg-indigo-500/50 flex-1"></span>주택 취득 조건<span className="h-px bg-indigo-500/50 flex-1"></span>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">취득 후 보유 주택 수</label>
                <select 
                  value={houseCount} 
                  onChange={(e) => setHouseCount(Number(e.target.value) as 1 | 2 | 3 | 4)}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-indigo-400 appearance-none cursor-pointer"
                >
                  <option value={1}>1주택 (무주택자 또는 일시적 1→2)</option>
                  <option value={2}>2주택 보유</option>
                  <option value={3}>3주택 보유</option>
                  <option value={4}>4주택 이상 또는 법인</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">조정대상지역 여부</label>
                <div className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between ${isAdj ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                  <div>
                    <div className={`font-bold ${isAdj ? 'text-rose-400' : 'text-slate-300'}`}>{isAdj ? '조정대상지역' : '비조정대상지역'}</div>
                    <div className="text-xs text-slate-500 mt-1">{isAdj ? '서울 전역, 강남 3구 등 중과 대상' : '서울 이외 대부분 지역'}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isAdj} onChange={(e) => setIsAdj(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">전용면적 (농특세 부과 기준)</label>
                <div className="relative mb-2">
                  <input 
                    type="number" 
                    value={area} 
                    onChange={(e) => setArea(Number(e.target.value))} 
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-indigo-400" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">㎡</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg flex gap-2 text-xs text-slate-300">
                  <span className="shrink-0">ℹ️</span>
                  <span>현재 입력: {area}㎡ — {area > 85 ? <strong className="text-rose-400">85㎡ 초과로 농어촌특별세 부과</strong> : <strong className="text-emerald-400">85㎡ 이하로 농어촌특별세 비과세</strong>}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden mt-8">
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">취득 시 총 납부 세액</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                {formatNumber(result.totalTax)}원
              </div>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.risk === 'danger' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : result.risk === 'warning' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'}`}>
                  합계세율 {result.totalR.toFixed(2)}%
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-600 text-slate-300">
                  {typeLabels[propertyType]}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-700/50">
              <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-slate-300 font-bold">취득세</span>
                  <span className="text-slate-500 text-xs">({result.acqR.toFixed(2)}%)</span>
                </div>
                <span className="text-white font-bold">{formatNumber(result.acqTax)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-slate-300 font-bold">지방교육세</span>
                  <span className="text-slate-500 text-xs">({result.eR.toFixed(2)}%)</span>
                </div>
                <span className="text-white font-bold">{formatNumber(result.eduTax)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-300 font-bold">농어촌특별세</span>
                  <span className="text-slate-500 text-xs">({result.fR > 0 ? result.fR.toFixed(2) + '%' : '비과세'})</span>
                </div>
                <span className="text-white font-bold">{result.fR > 0 ? `${formatNumber(result.farmTax)}원` : '0원'}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2">
              <span className="shrink-0 text-amber-400">📋</span>
              <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                {result.sumTxt}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              ※ 취득세 = 취득가액 × 세율<br/>
              ※ 지방교육세/농특세는 취득세율에 연동되어 자동 계산됩니다.
            </div>
          </div>

          <div className="mt-8 mb-4">
              <a href="https://link.coupang.com/a/d3Fm5zRXxs" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform">🏠</span>
                          <div>
                              <h3 className="text-lg font-black mb-0.5">부동산 절세의 모든 것! 추천 도서</h3>
                              <p className="text-blue-100 font-medium text-xs md:text-sm">취득세, 양도세 폭탄 피하는 실전 세금 가이드북</p>
                          </div>
                      </div>
                      <span className="shrink-0 text-center bg-white text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm group-hover:bg-indigo-50 transition-colors">
                          특가 보기 🚀
                      </span>
                  </div>
                  <div className="absolute bottom-1 right-3 text-[9px] text-white/30">파트너스 활동 수수료 제공 가능</div>
              </a>
          </div>
        </div>

        <div className="mt-8">
           <KakaoShareButton 
             title="부동산 취득세 계산기" 
             description="주택 수, 조정대상지역, 전용면적까지 2026년 기준 정확한 취득세 계산!" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">⚠️ 본 계산기 참고사항</h2>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            본 계산기는 <strong>일반 유상취득(매매)</strong>을 기준으로 세액을 산출합니다. 증여나 상속으로 인한 취득, 또는 생애최초 주택구입 취득세 감면 등 각종 <strong>특례 조항은 미반영</strong>되어 있습니다. 실제 납부할 세액은 계약일자, 취득원인 및 개인별 특례 요건에 따라 달라질 수 있으므로, 최종 납부 시에는 반드시 세무 전문가와 상담하시기 바랍니다.
          </p>
        </section>
      </article>
    </div>
  );
}
