"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const CALCULATORS = [
  // 투자 계산기
  { name: "중개형 ISA 비과세 및 연금 전환 절세 계산기", href: "/calculators/isa", icon: "🧮", tag: "투자" },
  { name: "국내/해외 주식 증권사 수수료 비교 계산기", href: "/calculators/broker-fee", icon: "📊", tag: "투자" },
  { name: "국민성장펀드 수익률 및 손실방어 계산기", href: "/calculators/growth-fund", icon: "🛡️", tag: "투자" },
  { name: "증여세 계산기", href: "/calculators/gift-tax", icon: "🎁", tag: "투자", badge: "NEW" },
  { name: "상속세 계산기", href: "/calculators/inheritance-tax", icon: "🪦", tag: "투자", badge: "NEW" },
  { name: "부동산 취득세 계산기", href: "/calculators/real-estate-tax", icon: "🏠", tag: "투자" },
  { name: "아파트 투자 수익률 계산기", href: "/calculators/apartment-roi", icon: "📈", tag: "투자" },
  { name: "실시간 금시세", href: "/calculators/gold-price", icon: "🪙", tag: "투자" },
  { name: "수익률 인증샷 메이커", href: "/calculators/yield-snapshot", icon: "📸", tag: "투자" },
  // 생활 계산기
  { name: "에어컨 전기세 계산기", href: "/calculators/air-conditioner-bill", icon: "🔌", tag: "생활", badge: "HOT" },
  { name: "예금 적금 최고 금리 비교 계산기", href: "/calculators/deposit", icon: "💰", tag: "생활" },
  { name: "퇴직금 계산기 및 IRP 세금 비교", href: "/calculators/severance", icon: "💼", tag: "생활" },
  { name: "실업급여 모의계산기", href: "/calculators/unemployment-benefit", icon: "💸", tag: "생활", badge: "NEW" },
  { name: "기초생활수급자 소득인정액 모의계산기", href: "/calculators/basic-livelihood", icon: "🏠", tag: "생활", badge: "NEW" },
  { name: "2026년 연봉 실수령액 계산기", href: "/calculators/salary", icon: "💸", tag: "생활" },
  { name: "2026년 알바 급여 계산기", href: "/calculators/part-time-salary", icon: "⏰", tag: "생활", badge: "NEW" },
  { name: "국민연금 감액기준 계산기", href: "/calculators/pension-reduction", icon: "👴", tag: "생활", badge: "HOT" },
  { name: "짠테크 수익 계산기", href: "/calculators/zzantech", icon: "☕", tag: "생활" },
  { name: "직장인/지역가입자 건강보험료 계산기", href: "/calculators/health-insurance", icon: "🏥", tag: "생활" },
  { name: "내 동네 지원금 찾기", href: "/calculators/grant-matcher", icon: "🎁", tag: "생활" },
  { name: "D-Day 목표 달성기 (1억 모으기)", href: "/calculators/goal-tracker", icon: "🎯", tag: "생활" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
 
  // 페이지(경로) 이동 시 검색창 및 모바일 메뉴 닫기
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
  }, [pathname]);

  const filtered = searchQuery.trim().length > 0
    ? CALCULATORS.filter((c) => {
        const cleanName = c.name.replace(/\s+/g, "").toLowerCase();
        const cleanTag = c.tag.replace(/\s+/g, "").toLowerCase();
        const cleanQuery = searchQuery.trim().replace(/\s+/g, "").toLowerCase();
        return cleanName.includes(cleanQuery) || cleanTag.includes(cleanQuery);
      })
    : [];

  // 엔터 입력 시 첫 번째 매칭되는 계산기로 바로 이동하는 함수
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const currentQuery = e.currentTarget.value.trim();
      if (currentQuery.length > 0) {
        const cleanQuery = currentQuery.replace(/\s+/g, "").toLowerCase();
        const matches = CALCULATORS.filter((c) => {
          const cleanName = c.name.replace(/\s+/g, "").toLowerCase();
          const cleanTag = c.tag.replace(/\s+/g, "").toLowerCase();
          return cleanName.includes(cleanQuery) || cleanTag.includes(cleanQuery);
        });

        if (matches.length > 0) {
          const bestMatch = matches[0];
          setIsSearchOpen(false);
          setSearchQuery("");
          router.push(bestMatch.href);
        }
      }
    }
  };

  // 외부 클릭 시 검색창 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색창 열리면 포커스
  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">💡</span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">FinInsight</span>
        </Link>

        {/* 검색바 (데스크탑) */}
        <div ref={searchRef} className="hidden sm:flex flex-1 max-w-xs relative">
          <div
            className={`flex items-center w-full gap-2 px-3 py-2 rounded-xl border transition-all ${
              isSearchOpen
                ? "border-emerald-400 bg-white shadow-md ring-2 ring-emerald-100"
                : "border-slate-200 bg-slate-50 hover:border-emerald-300 cursor-pointer"
            }`}
            onClick={() => setIsSearchOpen(true)}
          >
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="계산기 검색... (예: 증여세, 연봉)"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyUp={handleKeyUp}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSearchQuery(""); inputRef.current?.focus(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 검색 드롭다운 */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
              {searchQuery.trim() === "" ? (
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">인기 계산기</p>
                  <div className="space-y-1">
                    {CALCULATORS.filter(c => c.badge).slice(0, 5).map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          window.location.href = c.href;
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                      >
                        <span className="text-lg">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-600">{c.name}</p>
                        </div>
                        {c.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            c.badge === "HOT" ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"
                          }`}>{c.badge}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ) : filtered.length > 0 ? (
                <div className="p-2 max-h-72 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-400 px-3 pt-2 pb-1 uppercase tracking-wider">
                    검색 결과 {filtered.length}개
                  </p>
                  {filtered.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        window.location.href = c.href;
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group text-left"
                    >
                      <span className="text-lg">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-600">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.tag} 계산기</p>
                      </div>
                      {c.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          c.badge === "HOT" ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"
                        }`}>{c.badge}</span>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-slate-500">&apos;{searchQuery}&apos; 검색 결과 없음</p>
                  <p className="text-xs text-slate-400 mt-1">다른 키워드로 검색해보세요</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 데스크탑 네비 */}
        <nav className="hidden sm:flex items-center gap-4 shrink-0">
          <Link href="/#investment" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">투자 계산</Link>
          <Link href="/#life" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">생활 계산</Link>
          <a href="https://map.weknews.com/" target="_blank" rel="noopener noreferrer" className="relative group inline-flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
            <span className="relative text-sm font-bold bg-white text-sky-700 px-3 py-1.5 rounded-full border border-sky-200 shadow-sm flex items-center gap-1 group-hover:bg-sky-50 transition-colors">
              🏝️ 씨맵
            </span>
          </a>
          <Link href="/daily-report" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">📰 뉴스</Link>
        </nav>

        {/* 모바일: 검색 아이콘 + 햄버거 */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(!isSearchOpen); }}
            className="p-2 text-slate-600 hover:text-emerald-600 transition-colors"
            aria-label="검색"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => { setIsSearchOpen(false); setIsMobileMenuOpen(!isMobileMenuOpen); }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 검색창 */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 pb-3 bg-white border-b border-slate-100" ref={searchRef}>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-400 bg-white shadow-sm ring-2 ring-emerald-100">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="계산기 검색..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onKeyUp={handleKeyUp}
            />
          </div>
          {searchQuery.trim() !== "" && (
            <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
              {filtered.length > 0 ? (
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                  {filtered.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        window.location.href = c.href;
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="text-sm font-semibold text-slate-700 flex-1">{c.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">결과 없음</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-5 shadow-lg absolute w-full flex flex-col z-50">
          <Link href="/#investment" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">📈 투자 계산</Link>
          <Link href="/#life" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">☕ 생활 계산</Link>
          <Link href="/calculators/gift-tax" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-violet-700 hover:text-violet-500">🎁 증여세 계산기 <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full ml-1">NEW</span></Link>
          <Link href="/daily-report" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-indigo-600">📰 오늘의 핵심 핫이슈 (뉴스)</Link>
          <Link href="/calculators/goal-tracker" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">🎯 1억 모으기 목표 달성기</Link>
          <div className="pt-2 border-t border-slate-100">
            <a href="https://map.weknews.com/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
              <span className="inline-block text-base font-bold bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 px-4 py-3 rounded-xl border border-sky-200 w-full text-center shadow-sm">
                🏝️ 전국 여름 물놀이 씨맵 (Sea-Map)
              </span>
            </a>
            <a href="https://drive.weknews.com/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
              <span className="inline-block text-base font-bold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 px-4 py-3 rounded-xl border border-orange-200 w-full text-center shadow-sm">
                🚗 전국 감성 드라이브 코스 (Drive Map)
              </span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
