"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

const TAX_BRACKETS = [
  { min: 0,             max: 100_000_000,   rate: 0.10, deduction: 0 },
  { min: 100_000_000,   max: 500_000_000,   rate: 0.20, deduction: 10_000_000 },
  { min: 500_000_000,   max: 1_000_000_000, rate: 0.30, deduction: 60_000_000 },
  { min: 1_000_000_000, max: 3_000_000_000, rate: 0.40, deduction: 160_000_000 },
  { min: 3_000_000_000, max: Infinity,      rate: 0.50, deduction: 460_000_000 },
];

function calcTax(taxableBase: number): number {
  if (taxableBase <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxableBase <= b.max) return Math.max(0, taxableBase * b.rate - b.deduction);
  }
  return 0;
}

function fmtKRW(n: number): string {
  if (n <= 0) return "0원";
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const won = n % 10_000;
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (won > 0) parts.push(`${won.toLocaleString("ko-KR")}`);
  return parts.join(" ") + "원";
}

function parseInput(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}

type MainTab = "general" | "priorities" | "acquisition";

export default function InheritanceTaxCalculator() {
  const [mainTab, setMainTab] = useState<MainTab>("general");
  const [hasSpouse, setHasSpouse] = useState(true);
  const [assetStr, setAssetStr] = useState("");
  const [financialStr, setFinancialStr] = useState("");
  const [priorGiftStr, setPriorGiftStr] = useState("");
  const [calculated, setCalculated] = useState(false);

  const assetAmount = parseInput(assetStr);
  const financialAmount = parseInput(financialStr);
  const priorGift = parseInput(priorGiftStr);

  const deduction = useMemo(() => {
    // 일괄공제: 기본 5억 (기초공제 2억 + 인적공제액의 합계가 5억이 안되는 경우가 대부분이므로 5억 적용)
    const baseDeduction = 500_000_000;
    
    // 배우자공제: 생존 시 최소 5억 (최대 30억이나, 본 계산기에서는 보수적으로/기본으로 5억 적용)
    const spouseDeduction = hasSpouse ? 500_000_000 : 0;
    
    // 금융재산 상속공제
    let financialDeduction = 0;
    if (financialAmount > 0) {
      if (financialAmount <= 20_000_000) {
        financialDeduction = financialAmount;
      } else if (financialAmount <= 100_000_000) {
        financialDeduction = 20_000_000;
      } else {
        financialDeduction = Math.min(200_000_000, Math.round(financialAmount * 0.20));
      }
    }
    
    return baseDeduction + spouseDeduction + financialDeduction;
  }, [hasSpouse, financialAmount]);

  const result = useMemo(() => {
    const totalAsset = assetAmount + priorGift;
    const taxableBase = Math.max(0, totalAsset - deduction);
    const rawTax = calcTax(taxableBase);
    const filingDiscount = Math.round(rawTax * 0.03); // 신고세액공제 3%
    const finalTax = Math.max(0, rawTax - filingDiscount);
    const effectiveRate = assetAmount > 0 ? (finalTax / assetAmount) * 100 : 0;
    
    return { 
      baseDeduction: 500_000_000, 
      spouseDeduction: hasSpouse ? 500_000_000 : 0,
      financialDeduction: deduction - 500_000_000 - (hasSpouse ? 500_000_000 : 0),
      totalDeduction: deduction, 
      taxableBase, 
      rawTax, 
      filingDiscount, 
      finalTax, 
      effectiveRate 
    };
  }, [assetAmount, financialAmount, priorGift, deduction, hasSpouse]);

  const activeBracket = useMemo(() => {
    if (result.taxableBase <= 0) return null;
    for (const b of TAX_BRACKETS) {
      if (result.taxableBase <= b.max) return b;
    }
    return TAX_BRACKETS[TAX_BRACKETS.length - 1];
  }, [result.taxableBase]);

  const handleInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setter(raw);
      setCalculated(false);
    };

  const QUICK = [
    { label: "5억",   v: 500_000_000 },
    { label: "10억",  v: 1_000_000_000 },
    { label: "15억",  v: 1_500_000_000 },
    { label: "20억",  v: 2_000_000_000 },
    { label: "30억",  v: 3_000_000_000 },
    { label: "50억",  v: 5_000_000_000 },
  ];

  const TAB_LABELS: { key: MainTab; label: string }[] = [
    { key: "general",     label: "일반" },
    { key: "priorities",  label: "상속 순위" },
    { key: "acquisition", label: "상속 취득세" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link href="/" className="hover:text-violet-600 transition-colors">홈</Link>
        <span>›</span>
        <span>세금 계산기</span>
        <span>›</span>
        <span className="text-violet-600 font-bold">상속세 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* ── 메인 카드 ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-violet-600 p-7 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">🪦</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
                  상속세 계산기
                  <span className="text-xs bg-white/25 text-white px-3 py-1 rounded-full font-bold">2024 세법 적용</span>
                </h1>
                <p className="text-violet-200 text-sm font-medium mt-1">일괄공제 · 배우자공제 · 금융재산공제 완벽 반영</p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMainTab(key)}
              className={`flex-1 py-4 text-base font-bold transition-all border-b-2 ${
                mainTab === key
                  ? "border-violet-600 text-violet-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-violet-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── 일반 탭 ── */}
        {mainTab === "general" && (
          <div className="p-6 md:p-8 space-y-8 bg-slate-50">

            {/* ① 배우자 유무 선택 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-black">1</span>
                배우자 생존 여부 (배우자 상속공제)
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setHasSpouse(true); setCalculated(false); }}
                  className={`flex-1 py-4 rounded-2xl text-base font-bold border-2 transition-all ${
                    hasSpouse
                      ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-violet-300"
                  }`}
                >
                  👫 배우자 있음 (최소 5억 공제)
                </button>
                <button
                  type="button"
                  onClick={() => { setHasSpouse(false); setCalculated(false); }}
                  className={`flex-1 py-4 rounded-2xl text-base font-bold border-2 transition-all ${
                    !hasSpouse
                      ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-violet-300"
                  }`}
                >
                  단독 상속 (배우자 없음)
                </button>
              </div>
            </div>

            {/* ② 상속 자산 입력 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-black">2</span>
                상속재산 정보 입력
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">총 상속재산가액 (부동산, 예금 등 합계)</label>
                  <div className="flex gap-3 mb-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={assetStr ? parseInput(assetStr).toLocaleString("ko-KR") : ""}
                        onChange={handleInput(setAssetStr)}
                        placeholder="금액 입력"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-4 text-2xl font-extrabold text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all text-right pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-slate-400 font-bold">원</span>
                    </div>
                  </div>
                  {assetAmount > 0 && (
                    <p className="text-right text-base text-violet-600 font-bold mb-3">{fmtKRW(assetAmount)}</p>
                  )}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {QUICK.map(({ label, v }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setAssetStr(String(v)); setCalculated(false); }}
                        className={`py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                          assetAmount === v
                            ? "bg-violet-600 text-white border-violet-600 shadow-md"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2">금융재산 (예금, 주식 등 / 선택사항)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={financialStr ? parseInput(financialStr).toLocaleString("ko-KR") : ""}
                        onChange={handleInput(setFinancialStr)}
                        placeholder="총 자산 중 금융재산 금액"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-violet-400 transition-all text-right pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">입력 시 금융재산상속공제 자동 적용 (최대 2억)</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-amber-600 block mb-2">10년 내 사전증여재산 (선택사항)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={priorGiftStr ? parseInput(priorGiftStr).toLocaleString("ko-KR") : ""}
                        onChange={handleInput(setPriorGiftStr)}
                        placeholder="사전증여액"
                        className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-amber-400 transition-all text-right pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">상속개시일 전 10년 이내 증여한 재산 가산</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { if (assetAmount > 0) setCalculated(true); }}
                  className="w-full mt-4 px-7 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5"
                >
                  🧮 상속세 계산하기
                </button>
              </div>
            </div>

            {/* ── 계산 결과 ── */}
            {calculated && assetAmount > 0 && (
              <div className="space-y-5">
                {/* 최종 세액 히어로 */}
                <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-violet-600 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-violet-200">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
                  <div className="relative z-10">
                    <p className="text-violet-200 text-base font-semibold mb-2">예상 납부 상속세 (신고세액공제 3% 적용)</p>
                    <div className="flex items-end justify-between flex-wrap gap-3">
                      <p className="text-5xl md:text-6xl font-black text-white">
                        {fmtKRW(result.finalTax)}
                      </p>
                      <div className="text-right">
                        <p className="text-violet-300 text-sm font-medium">유효 세율</p>
                        <p className="text-3xl font-black text-white">{result.effectiveRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 요약 카드 2개 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-violet-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-violet-500 uppercase tracking-wide mb-2">과세표준</p>
                    <p className="text-2xl font-black text-slate-800">{fmtKRW(result.taxableBase)}</p>
                  </div>
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-2">총 공제액</p>
                    <p className="text-2xl font-black text-emerald-600">{fmtKRW(result.totalDeduction)}</p>
                  </div>
                </div>

                {/* 상세 내역 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
                  <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">🔍 상세 계산 내역</h3>
                  <div className="space-y-3">
                    {[
                      { label: "총 상속재산가액",         val: assetAmount,          color: "text-slate-800", prefix: "" },
                      ...(priorGift > 0 ? [
                        { label: "+ 사전증여재산 합산",    val: priorGift,            color: "text-amber-600", prefix: "+" },
                      ] : []),
                      { label: "- 일괄공제 (기본 5억)",   val: result.baseDeduction, color: "text-red-500",   prefix: "-" },
                      { label: "- 배우자공제 (최소액)",   val: result.spouseDeduction, color: "text-red-500", prefix: "-" },
                      ...(result.financialDeduction > 0 ? [
                        { label: "- 금융재산공제",        val: result.financialDeduction, color: "text-red-500", prefix: "-" },
                      ] : []),
                      { label: "= 과세표준",              val: result.taxableBase, color: "text-violet-700", prefix: "" },
                      { label: "산출세액 (세율 적용)",     val: result.rawTax,       color: "text-slate-800", prefix: "" },
                      { label: "- 신고세액공제 (3%)",     val: result.filingDiscount, color: "text-emerald-600", prefix: "-" },
                    ].map(({ label, val, color, prefix }, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-none">
                        <span className="text-base text-slate-600 font-medium">{label}</span>
                        <span className={`text-lg font-black ${color}`}>{prefix}{fmtKRW(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-t-2 border-violet-300 pt-4 mt-2">
                      <span className="text-lg font-black text-violet-700">예상 납부 상속세</span>
                      <span className="text-2xl font-black text-violet-700">{fmtKRW(result.finalTax)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">※ 배우자상속공제는 실제 상속 비율에 따라 늘어날 수 있으며, 본 계산기는 최소 공제액(5억)을 기준으로 계산되었습니다.</p>
                </div>
              </div>
            )}

            {/* 세율표 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-violet-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-700">📊 상속세 과세 기준표 (증여세와 동일)</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-3 px-5 text-left text-sm font-bold text-slate-500">과세표준 구간</th>
                    <th className="py-3 px-5 text-center text-sm font-bold text-slate-500">세율</th>
                    <th className="py-3 px-5 text-right text-sm font-bold text-slate-500">누진공제액</th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_BRACKETS.map((b, i) => {
                    const lower = i === 0 ? 0 : TAX_BRACKETS[i - 1].max;
                    const rangeLabel = b.max === Infinity ? "30억원 초과" : i === 0 ? "1억원 이하" : `${fmtKRW(lower)} ~ ${fmtKRW(b.max)} 이하`;
                    const isActive = activeBracket === b && calculated;
                    return (
                      <tr key={i} className={`border-t border-slate-100 transition-colors ${isActive ? "bg-violet-50 border-l-4 border-l-violet-500" : "hover:bg-slate-50"}`}>
                        <td className={`py-4 px-5 text-base ${isActive ? "text-violet-700 font-black" : "text-slate-600 font-medium"}`}>
                          {isActive && <span className="text-violet-500 mr-1">▶</span>}{rangeLabel}
                        </td>
                        <td className={`py-4 px-5 text-center font-black text-2xl ${isActive ? "text-violet-600" : "text-slate-700"}`}>
                          {(b.rate * 100).toFixed(0)}%
                        </td>
                        <td className={`py-4 px-5 text-right text-base font-bold ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
                          {b.deduction === 0 ? "0원" : fmtKRW(b.deduction)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 주의사항 */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <p className="text-base font-black text-amber-700 mb-3 flex items-center gap-2">⚠️ 주의사항</p>
              <ul className="space-y-2 text-sm text-amber-800 font-medium leading-relaxed">
                <li>• 부동산 상속 시 상속 취득세가 별도 발생합니다. 상속 취득세 탭을 확인하세요.</li>
                <li>• 상속세 신고기한은 상속개시일이 속하는 달의 말일부터 6개월 이내입니다.</li>
                <li>• 본 계산기는 보수적 접근(최소 공제)을 통한 참고용이며, 정확한 세액은 세무사와 상담하세요.</li>
              </ul>
            </div>

            {/* 전문가 상담 배너 */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6 text-center">
              <p className="text-xl font-black text-violet-800 mb-1">💼 전문 세무사에게 세무상담 받기</p>
              <p className="text-sm text-violet-500 font-medium">상속세 신고 · 절세 설계 · 가업상속공제 상담</p>
            </div>
          </div>
        )}

        {/* ── 상속 순위 탭 ── */}
        {mainTab === "priorities" && (
          <div className="p-6 md:p-8 bg-slate-50">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="text-6xl">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-black text-slate-800">법정 상속 순위 안내</h3>
                <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                  유언이 없는 경우, 민법에서 정한 순위에 따라 상속이 이루어집니다.
                </p>
              </div>
              
              <div className="space-y-3 mt-4">
                {[
                  { rank: "1순위", target: "직계비속 (자녀, 손자녀) + 배우자", desc: "배우자는 직계비속과 공동 상속인이 되며, 5할(50%)을 가산하여 받습니다." },
                  { rank: "2순위", target: "직계존속 (부모, 조부모) + 배우자", desc: "직계비속이 없는 경우, 직계존속과 배우자가 공동 상속인이 됩니다." },
                  { rank: "3순위", target: "형제자매", desc: "1, 2순위 및 배우자가 모두 없는 경우 상속받습니다." },
                  { rank: "4순위", target: "4촌 이내의 방계혈족", desc: "1, 2, 3순위가 모두 없는 경우 상속받습니다." },
                ].map(({ rank, target, desc }) => (
                  <div key={rank} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <span className="shrink-0 px-3 py-1 bg-violet-100 text-violet-700 font-black rounded-lg text-sm">{rank}</span>
                    <div>
                      <p className="text-base font-bold text-slate-800">{target}</p>
                      <p className="text-sm text-slate-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-violet-50 p-4 rounded-xl mt-4">
                <p className="text-sm font-bold text-violet-700 mb-1">📌 배우자의 상속 순위</p>
                <p className="text-sm text-violet-600">배우자는 1순위(직계비속)와 동순위, 직계비속이 없으면 2순위(직계존속)와 동순위가 되며, 1·2순위가 모두 없으면 단독 상속인이 됩니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 상속 취득세 탭 ── */}
        {mainTab === "acquisition" && (
          <div className="p-6 md:p-8 bg-slate-50">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center space-y-5">
              <div className="text-6xl">📜</div>
              <h3 className="text-2xl font-black text-slate-800">상속 취득세 안내</h3>
              <p className="text-base text-slate-500 leading-relaxed max-w-md mx-auto">
                부동산을 상속받을 때 발생하는 취득세입니다.<br/>무주택자가 1주택을 상속받는 경우 특례세율이 적용됩니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {[
                  { label: "일반적인 상속 (농지 외)", rate: "2.8%" },
                  { label: "농지의 상속", rate: "2.3%" },
                  { label: "1가구 1주택 특례 (무주택자)", rate: "0.8%" },
                  { label: "취득세 외 부가세", rate: "지방교육세 0.16% 등 별도" },
                ].map(({ label, rate }) => (
                  <div key={label} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                    <span className="text-xl font-black text-violet-600">{rate}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400 mt-4">※ 상속 취득세는 상속개시일(사망일)이 속하는 달의 말일로부터 6개월 이내 신고 납부해야 합니다.</p>
              <Link href="/calculators/real-estate-tax" className="inline-block mt-4 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base rounded-xl transition-all shadow-md">
                부동산 취득세 계산기 →
              </Link>
            </div>
          </div>
        )}

        {/* 공유 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <ShareButtons
            title="상속세 계산기 - 일괄공제 및 배우자공제 자동 적용"
            description="상속재산가액과 배우자 유무를 입력하여 예상 상속세액을 쉽게 계산해보세요."
            kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01"
          />
        </div>
      </div>

      {/* ── 안내 아티클 ── */}
      <article className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">상속세 완벽 가이드</h2>
        <section className="space-y-6 text-slate-700 text-base leading-relaxed">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">1. 핵심 상속공제 한도 정리</h3>
            <table className="w-full text-base border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-violet-50">
                  <th className="py-3 px-5 text-left text-slate-700 font-bold">공제 항목</th>
                  <th className="py-3 px-5 text-right text-slate-700 font-bold">공제 한도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["기초공제 + 기타 인적공제", "합산액"],
                  ["일괄공제 (위 합산액과 비교해 큰 금액 적용)", "기본 5억 원"],
                  ["배우자 상속공제 (배우자 생존 시)", "최소 5억 원 ~ 최대 30억 원"],
                  ["금융재산 상속공제 (순금융재산의 20%)", "최대 2억 원"],
                  ["동거주택 상속공제", "최대 6억 원"],
                ].map(([rel, limit]) => (
                  <tr key={rel} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{rel}</td>
                    <td className="py-3 px-5 text-right font-black text-violet-600 text-lg">{limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-slate-500 mt-2 ml-1">※ 일반적인 경우 일괄공제 5억 + 배우자공제 5억 = 최소 10억 원까지는 상속세가 발생하지 않습니다.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">2. 절세 핵심 전략</h3>
            <ul className="space-y-3">
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>배우자 상속공제의 극대화:</strong> 배우자가 상속받는 비율을 높여 최대 30억 원까지 세금 없이 공제 가능.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>사전 증여 활용:</strong> 상속개시 전 10년(상속인) 또는 5년(비상속인) 이상 전에 증여하면 상속재산에서 제외됩니다.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>동거주택 상속공제:</strong> 피상속인과 10년 이상 계속하여 동거한 무주택 상속인의 경우 주택가액을 공제(최대 6억) 받을 수 있습니다.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>신고 기한 준수:</strong> 6개월 내에 신고 납부 시 산출세액의 3%를 공제받을 수 있습니다.</span></li>
            </ul>
          </div>
        </section>
        <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
          <WordPressLink title="증여세 계산기" url="/calculators/gift-tax" />
          <WordPressLink title="연말정산 환급금 계산기" url="/calculators/tax-return" />
          <WordPressLink title="종합소득세 계산기" url="/calculators/freelancer-tax" />
        </div>
      </article>
    </div>
  );
}
