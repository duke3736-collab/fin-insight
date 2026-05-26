"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">FinInsight</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/#investment" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">투자 계산</Link>
          <Link href="/#life" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">생활 계산</Link>
          <a href="https://map.weknews.com/" target="_blank" rel="noopener noreferrer" className="relative group inline-flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <span className="relative text-sm font-bold bg-white text-sky-700 px-4 py-1.5 rounded-full border border-sky-200 shadow-sm flex items-center gap-1 group-hover:bg-sky-50 transition-colors">
              🏝️ 전국 물놀이 지도
            </span>
          </a>
          <Link href="/daily-report" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">📰 오늘의 뉴스</Link>
          <Link href="/calculators/goal-tracker" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">1억 모으기</Link>
        </nav>
        
        {/* Mobile Hamburger Button */}
        <button 
          className="sm:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-5 shadow-lg absolute w-full flex flex-col">
          <Link href="/#investment" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">📈 투자 계산</Link>
          <Link href="/#life" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">☕ 생활 계산</Link>
          <Link href="/daily-report" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-indigo-600">📰 오늘의 핵심 핫이슈 (뉴스)</Link>
          <Link href="/calculators/goal-tracker" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-bold text-slate-700 hover:text-emerald-600">🎯 1억 모으기 목표 달성기</Link>
          
          <div className="pt-2 border-t border-slate-100">
            <a href="https://map.weknews.com/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
              <span className="inline-block text-base font-bold bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 px-4 py-3 rounded-xl border border-sky-200 w-full text-center shadow-sm">
                🏝️ 전국 여름 물놀이 씨맵 (Sea-Map)
              </span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
