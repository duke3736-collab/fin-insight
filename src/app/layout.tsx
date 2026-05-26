import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";

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
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png"
  },
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
        <Header />

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
