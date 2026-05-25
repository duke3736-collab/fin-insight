import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinInsight | 스마트 금융 계산기 포털",
  description: "당신의 금융 자산을 똑똑하게 관리하세요. ISA 절세, 퇴직금, 예적금 계산기 종합 제공",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinInsight",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6635245275061755"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        {/* Header */}
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">FinInsight</span>
            </Link>
            <nav className="hidden sm:flex gap-6">
              <Link href="/#investment" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">투자 계산기</Link>
              <Link href="/#life" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">생활 계산기</Link>
              <Link href="/daily-report" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">데일리 리포트</Link>
              <Link href="/calculators/goal-tracker" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">1억 모으기</Link>
            </nav>
            <button className="sm:hidden p-2 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full bg-slate-900 text-slate-400 py-12 mt-12">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-white text-lg mb-2">FinInsight</p>
              <p className="text-sm">스마트한 투자자를 위한 필수 앱</p>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>© 2026 FinInsight. All rights reserved.</p>
              <p className="mt-1">
                <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link> | <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
