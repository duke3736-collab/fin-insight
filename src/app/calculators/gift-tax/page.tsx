"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type RelKey = "spouse" | "lineal_asc" | "lineal_desc" | "other_kin" | "other";

const RELATIONSHIP_GROUPS: { key: RelKey; label: string; emoji: string }[] = [
  { key: "spouse",      label: "배우자",     emoji: "💑" },
  { key: "lineal_asc",  label: "직계존속",   emoji: "👨‍👩‍👧" },
  { key: "lineal_desc", label: "직계비속",   emoji: "👶" },
  { key: "other_kin",   label: "그 외 친족", emoji: "👥" },
  { key: "other",       label: "기타",       emoji: "🤝" },
];

const BASE_DEDUCTION: Record<RelKey, number> = {
  spouse:      600_000_000,
  lineal_asc:  50_000_000,
  lineal_desc: 50_000_000,
  other_kin:   10_000_000,
  other:       0,
};

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

type MainTab = "general" | "acquisition" | "burden";

export default function GiftTaxCalculator() {
  const [mainTab, setMainTab] = useState<MainTab>("general");
  const [relationship, setRelationship] = useState<RelKey>("lineal_desc");
  const [isMinor, setIsMinor]           = useState(false);
  const [isDisabled, setIsDisabled]     = useState(false);
  const [hasPriorGift, setHasPriorGift] = useState(false);
  const [isFinancial, setIsFinancial]   = useState(false);
  const [giftStr, setGiftStr]           = useState("");
  const [priorGiftStr, setPriorGiftStr] = useState("");
  const [priorTaxStr, setPriorTaxStr]   = useState("");
  const [calculated, setCalculated]     = useState(false);

  const giftAmount = parseInput(giftStr);
  const priorGift  = parseInput(priorGiftStr);
  const priorTax   = parseInput(priorTaxStr);

  const deduction = useMemo(() => {
    let base = BASE_DEDUCTION[relationship];
    if ((relationship === "lineal_desc" || relationship === "lineal_asc") && isMinor) base = 20_000_000;
    const disabledExtra = isDisabled ? 600_000_000 : 0;
    const financialDeduction = isFinancial ? Math.min(200_000_000, Math.round(giftAmount * 0.20)) : 0;
    return base + disabledExtra + financialDeduction;
  }, [relationship, isMinor, isDisabled, isFinancial, giftAmount]);

  const result = useMemo(() => {
    const totalGift        = giftAmount + priorGift;
    const priorTaxableBase = Math.max(0, priorGift - deduction);
    const totalTaxableBase = Math.max(0, totalGift - deduction);
    const curTaxableBase   = Math.max(0, totalTaxableBase - priorTaxableBase);
    const totalRawTax      = calcTax(totalTaxableBase);
    const priorRawTax      = calcTax(priorTaxableBase);
    const rawTax           = Math.max(0, totalRawTax - priorRawTax - priorTax);
    const filingDiscount   = Math.round(rawTax * 0.03);
    const finalTax         = Math.max(0, rawTax - filingDiscount);
    const effectiveRate    = giftAmount > 0 ? (finalTax / giftAmount) * 100 : 0;
    return { deduction, curTaxableBase, rawTax, filingDiscount, finalTax, effectiveRate };
  }, [giftAmount, priorGift, priorTax, deduction]);

  const activeBracket = useMemo(() => {
    if (result.curTaxableBase <= 0) return null;
    for (const b of TAX_BRACKETS) {
      if (result.curTaxableBase <= b.max) return b;
    }
    return TAX_BRACKETS[TAX_BRACKETS.length - 1];
  }, [result.curTaxableBase]);

  const reGiftTax = useMemo(() => {
    const base = Math.max(0, giftAmount - BASE_DEDUCTION[relationship]);
    const raw  = calcTax(base);
    return Math.max(0, raw - Math.round(raw * 0.03));
  }, [giftAmount, relationship]);

  const handleInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setter(raw);
      setCalculated(false);
    };

  const QUICK = [
    { label: "5천만", v: 50_000_000 },
    { label: "1억",   v: 100_000_000 },
    { label: "3억",   v: 300_000_000 },
    { label: "5억",   v: 500_000_000 },
    { label: "10억",  v: 1_000_000_000 },
    { label: "30억",  v: 3_000_000_000 },
  ];

  const TAB_LABELS: { key: MainTab; label: string }[] = [
    { key: "general",     label: "일반" },
    { key: "acquisition", label: "증여 취득세" },
    { key: "burden",      label: "부담부증여" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link href="/" className="hover:text-violet-600 transition-colors">홈</Link>
        <span>›</span>
        <span>세금 계산기</span>
        <span>›</span>
        <span className="text-violet-600 font-bold">증여세 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* ── 메인 카드 ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-500 p-7 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">🎁</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
                  증여세 계산기
                  <span className="text-xs bg-white/25 text-white px-3 py-1 rounded-full font-bold">2024 세법 적용</span>
                </h1>
                <p className="text-violet-200 text-sm font-medium mt-1">관계별 공제 · 금융재산공제 · 신고세액공제 완벽 반영</p>
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

            {/* ① 수증자 관계 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-black">1</span>
                수증자(받는 사람) 관계 선택
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {RELATIONSHIP_GROUPS.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setRelationship(key); setCalculated(false); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold border-2 transition-all ${
                      relationship === key
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 border-transparent text-white shadow-lg shadow-violet-200"
                        : "bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span> {label}
                  </button>
                ))}
              </div>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <span className="text-base text-violet-700 font-semibold">
                  {RELATIONSHIP_GROUPS.find(r => r.key === relationship)?.label} 기본 증여재산공제
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-violet-700">{fmtKRW(BASE_DEDUCTION[relationship])}</span>
                  <span className="text-xs text-violet-400 ml-2 font-medium">(10년 통산)</span>
                </div>
              </div>
            </div>

            {/* ② 특수 조건 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-black">2</span>
                특수 조건 선택
                <span className="text-sm font-medium text-slate-400">(해당 항목만 체크)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "check-minor", state: isMinor, setter: setIsMinor,
                    label: "미성년자 수증자",
                    desc: "공제한도 → 2천만 원",
                    show: relationship === "lineal_desc" || relationship === "lineal_asc",
                  },
                  {
                    id: "check-disabled", state: isDisabled, setter: setIsDisabled,
                    label: "장애인 수증자",
                    desc: "추가 공제 6억 원",
                    show: true,
                  },
                  {
                    id: "check-prior", state: hasPriorGift, setter: setHasPriorGift,
                    label: "과거 10년 동일인 증여 있음",
                    desc: "합산 과세 적용",
                    show: true,
                  },
                  {
                    id: "check-financial", state: isFinancial, setter: setIsFinancial,
                    label: "금융재산 증여",
                    desc: "20% 추가공제 (최대 2억)",
                    show: true,
                  },
                ]
                  .filter(o => o.show)
                  .map(({ id, state, setter, label, desc }) => (
                    <label
                      key={id}
                      htmlFor={id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        state
                          ? "bg-violet-50 border-violet-400"
                          : "bg-slate-50 border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={state}
                        onChange={e => { setter(e.target.checked); setCalculated(false); }}
                        className="mt-1 accent-violet-600 w-5 h-5 shrink-0"
                      />
                      <div>
                        <p className={`text-base font-bold ${state ? "text-violet-800" : "text-slate-700"}`}>{label}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            {/* ③ 금액 입력 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-black">3</span>
                증여재산 금액 입력
              </h2>

              <div className="flex gap-3 mb-3">
                <div className="relative flex-1">
                  <input
                    id="gift-amount-input"
                    type="text"
                    inputMode="numeric"
                    value={giftStr ? parseInput(giftStr).toLocaleString("ko-KR") : ""}
                    onChange={handleInput(setGiftStr)}
                    placeholder="금액 입력"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-4 text-2xl font-extrabold text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all text-right pr-12 placeholder:text-slate-300 placeholder:text-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-slate-400 font-bold">원</span>
                </div>
                <button
                  id="calc-button"
                  type="button"
                  onClick={() => { if (giftAmount > 0) setCalculated(true); }}
                  className="shrink-0 px-7 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  🧮 계산
                </button>
              </div>

              {giftAmount > 0 && (
                <p className="text-right text-base text-violet-600 font-bold mb-4">{fmtKRW(giftAmount)}</p>
              )}

              <div className="grid grid-cols-6 gap-2 mb-4">
                {QUICK.map(({ label, v }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setGiftStr(String(v)); setCalculated(false); }}
                    className={`py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                      giftAmount === v
                        ? "bg-violet-600 text-white border-violet-600 shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hasPriorGift && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-amber-100">
                  <div>
                    <label className="text-sm font-bold text-amber-600 block mb-2">10년 내 과거 증여 합계</label>
                    <div className="relative">
                      <input
                        id="prior-gift-input"
                        type="text"
                        inputMode="numeric"
                        value={priorGiftStr ? parseInput(priorGiftStr).toLocaleString("ko-KR") : ""}
                        onChange={handleInput(setPriorGiftStr)}
                        placeholder="0"
                        className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-amber-400 transition-all text-right pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-amber-600 block mb-2">과거 기납부 증여세액</label>
                    <div className="relative">
                      <input
                        id="prior-tax-input"
                        type="text"
                        inputMode="numeric"
                        value={priorTaxStr ? parseInput(priorTaxStr).toLocaleString("ko-KR") : ""}
                        onChange={handleInput(setPriorTaxStr)}
                        placeholder="0"
                        className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-amber-400 transition-all text-right pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">원</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── 계산 결과 ── */}
            {calculated && giftAmount > 0 && (
              <div className="space-y-5">

                {/* 최종 세액 히어로 */}
                <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-500 rounded-2xl p-7 relative overflow-hidden shadow-xl shadow-violet-200">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
                  <div className="relative z-10">
                    <p className="text-violet-200 text-base font-semibold mb-2">최종 납부 증여세 (신고세액공제 3% 적용)</p>
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
                    <p className="text-2xl font-black text-slate-800">{fmtKRW(result.curTaxableBase)}</p>
                  </div>
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-2">신고공제 절세액</p>
                    <p className="text-2xl font-black text-emerald-600">{fmtKRW(result.filingDiscount)}</p>
                  </div>
                </div>

                {/* 상세 내역 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
                  <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">🔍 상세 계산 내역</h3>
                  <div className="space-y-3">
                    {[
                      { label: "증여재산가액",         val: giftAmount,          color: "text-slate-800", prefix: "" },
                      ...(priorGift > 0 ? [
                        { label: "+ 10년 내 합산 과거 증여", val: priorGift,      color: "text-amber-600", prefix: "+" },
                      ] : []),
                      { label: "- 증여재산공제",        val: result.deduction,    color: "text-red-500",   prefix: "-" },
                      { label: "= 과세표준",            val: result.curTaxableBase, color: "text-violet-700", prefix: "" },
                      { label: "산출세액 (세율 적용)",   val: result.rawTax,       color: "text-slate-800", prefix: "" },
                      ...(priorTax > 0 ? [
                        { label: "- 기납부세액 공제",    val: priorTax,           color: "text-emerald-600", prefix: "-" },
                      ] : []),
                      { label: "- 신고세액공제 (3%)",   val: result.filingDiscount, color: "text-emerald-600", prefix: "-" },
                    ].map(({ label, val, color, prefix }, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-none">
                        <span className="text-base text-slate-600 font-medium">{label}</span>
                        <span className={`text-lg font-black ${color}`}>{prefix}{fmtKRW(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-t-2 border-violet-300 pt-4 mt-2">
                      <span className="text-lg font-black text-violet-700">최종 납부 증여세</span>
                      <span className="text-2xl font-black text-violet-700">{fmtKRW(result.finalTax)}</span>
                    </div>
                  </div>
                </div>

                {/* 재증여 시뮬레이션 */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: "🏠", title: "양도세", badge: "별도 계산", badgeColor: "bg-sky-100 text-sky-700", desc: "취득가액 = 증여 당시 평가액 기준, 매도 시 부과" },
                    { icon: "📋", title: "취득세", badge: "탭 이동", badgeColor: "bg-purple-100 text-purple-700", desc: "증여 취득세 탭에서 확인하세요" },
                    { icon: "🔁", title: "10년 후 재증여", badge: fmtKRW(reGiftTax), badgeColor: "bg-violet-100 text-violet-700", desc: "공제 리셋 후 동일 금액 재증여 예상세액" },
                  ].map(({ icon, title, badge, badgeColor, desc }) => (
                    <div key={title} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-2xl">{icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                      </div>
                      <p className="text-sm font-black text-slate-800 mb-1">{title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 세율표 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-violet-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-700">📊 증여세 과세 기준표</h3>
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
                <li>• 부동산 증여 시 취득세가 별도 발생합니다. 증여 취득세 탭을 확인하세요.</li>
                <li>• 증여세 신고기한은 증여일로부터 3개월 이내, 자진신고 시 3% 세액공제 적용됩니다.</li>
                <li>• 본 계산기는 참고용이며, 정확한 세액은 세무사 또는 세무서에 확인하세요.</li>
              </ul>
            </div>

            {/* 전문가 상담 배너 */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6 text-center">
              <p className="text-xl font-black text-violet-800 mb-1">💼 전문 세무사에게 세무상담 받기</p>
              <p className="text-sm text-violet-500 font-medium">양도세 · 증여세 · 상속세 · 절세 설계 상담</p>
            </div>
          </div>
        )}

        {/* ── 증여 취득세 탭 ── */}
        {mainTab === "acquisition" && (
          <div className="p-6 md:p-8 bg-slate-50">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center space-y-5">
              <div className="text-6xl">🏠</div>
              <h3 className="text-2xl font-black text-slate-800">증여 취득세 안내</h3>
              <p className="text-base text-slate-500 leading-relaxed max-w-md mx-auto">
                부동산을 증여받을 때 납부하는 취득세입니다.<br/>주택 수, 조정대상지역 여부에 따라 세율이 달라집니다.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { label: "주택 (조정대상지역, 3억 이상)", rate: "12%" },
                  { label: "주택 (비조정대상지역)", rate: "3.5%" },
                  { label: "토지·건물 (주택 외)", rate: "3.5%" },
                  { label: "농지", rate: "3.0%" },
                ].map(({ label, rate }) => (
                  <div key={label} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                    <span className="text-xl font-black text-violet-600">{rate}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">※ 지방교육세·농어촌특별세 별도</p>
              <Link href="/calculators/real-estate-tax" className="inline-block px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base rounded-xl transition-all shadow-md">
                부동산 취득세 계산기 →
              </Link>
            </div>
          </div>
        )}

        {/* ── 부담부증여 탭 ── */}
        {mainTab === "burden" && (
          <div className="p-6 md:p-8 bg-slate-50">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="text-6xl">⚖️</div>
                <h3 className="text-2xl font-black text-slate-800">부담부증여란?</h3>
                <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                  채무(전세보증금, 담보대출 등)가 있는 부동산을 증여할 때,<br/>
                  채무 부분은 <strong className="text-amber-600">양도세</strong>로,
                  순수 증여 부분은 <strong className="text-violet-600">증여세</strong>로 각각 과세됩니다.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-5">
                  <p className="text-base font-black text-violet-700 mb-2">📦 증여세 과세 부분</p>
                  <p className="text-sm text-violet-600 leading-relaxed">시가 - 채무액 = 순수 증여가액<br/>이 부분에 대해 <strong>증여세</strong>가 부과됩니다.</p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                  <p className="text-base font-black text-amber-700 mb-2">🏷 양도세 과세 부분</p>
                  <p className="text-sm text-amber-700 leading-relaxed">채무액 부분은 유상 양도로 보아<br/><strong>양도세</strong>가 부과됩니다.</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-base font-black text-slate-700 mb-3">📌 부담부증여가 유리한 경우</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> 증여자의 양도차익이 적거나 없는 경우</li>
                  <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> 수증자가 채무를 실제 부담할 능력이 있는 경우</li>
                  <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> 증여세율보다 양도세율이 낮은 경우 (1세대 1주택 비과세 등)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 공유 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <ShareButtons
            title="증여세 계산기 - 관계별 공제·금융재산공제 완벽 반영"
            description="자녀, 배우자 등 관계별 증여세를 정확하게 계산하고 절세 전략을 확인해보세요!"
            kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01"
          />
        </div>
      </div>

      {/* ── 안내 아티클 ── */}
      <article className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">증여세 완벽 가이드</h2>
        <section className="space-y-6 text-slate-700 text-base leading-relaxed">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">1. 관계별 증여재산공제 한도 (10년 통산)</h3>
            <table className="w-full text-base border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-violet-50">
                  <th className="py-3 px-5 text-left text-slate-700 font-bold">관계</th>
                  <th className="py-3 px-5 text-right text-slate-700 font-bold">공제한도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["배우자", "6억 원"],
                  ["직계존·비속 (성년)", "5천만 원"],
                  ["직계존·비속 (미성년)", "2천만 원"],
                  ["형제자매", "1천만 원"],
                  ["기타 친족", "1천만 원"],
                  ["타인 (비친족, 법인)", "없음"],
                ].map(([rel, limit]) => (
                  <tr key={rel} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{rel}</td>
                    <td className="py-3 px-5 text-right font-black text-violet-600 text-lg">{limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">2. 절세 핵심 전략</h3>
            <ul className="space-y-3">
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>10년 주기 분산 증여:</strong> 공제한도는 10년마다 리셋됩니다.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>배우자 증여 최대 활용:</strong> 배우자에게 6억 원까지 세금 없이 증여 가능.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>미성년 자녀 조기 증여:</strong> 미성년 2천만 + 성년 후 5천만 = 총 7천만 원 활용 가능.</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>금융재산 공제:</strong> 현금·예금·주식 증여 시 20% 추가 공제 (최대 2억).</span></li>
              <li className="flex gap-3"><span className="text-violet-500 font-black mt-0.5">•</span><span><strong>자진신고 3% 할인:</strong> 증여일로부터 3개월 내 신고 시 3% 추가 공제.</span></li>
            </ul>
          </div>
        </section>
        <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
          <WordPressLink title="부동산 취득세 계산기" url="/calculators/real-estate-tax" />
          <WordPressLink title="연봉 실수령액 계산기" url="/calculators/salary" />
          <WordPressLink title="퇴직금 계산기 및 IRP 세금 혜택 비교" url="/calculators/severance" />
        </div>
      </article>
    </div>
  );
}
