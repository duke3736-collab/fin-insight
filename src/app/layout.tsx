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
  title: "FinInsight | 스마트 금융 계산기 포털 (증여세, ISA, 퇴직금, 예적금)",
  description: "당신의 금융 자산을 똑똑하게 관리하세요. 2026년 최신 개정 증여세 계산기, 중개형 ISA 절세 계산기, 퇴직금 계산기, 예적금 이자 계산기 등 필수 금융 도구를 제공합니다.",
  keywords: "증여세 계산기, ISA 절세 계산기, 중개형 ISA, 퇴직금 계산기, 예적금 이자 계산기, 금융 계산기, 재테크, 목돈 마련, 연말정산, 비과세 혜택, 복리 계산기, 대출 이자 계산기, 에어컨 전기세 계산기",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "FinInsight | 스마트 금융 계산기 포털",
    description: "2026 증여세, 중개형 ISA 절세, 퇴직금, 예적금 이자까지 스마트하게 계산하세요.",
    url: "https://tools.weknews.com",
    siteName: "FinInsight",
    locale: "ko_KR",
    type: "website",
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
        {/* Google Analytics 4 */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-2LM4R4HQJ2`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2LM4R4HQJ2');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FinInsight - 스마트 금융 계산기",
              "url": "https://tools.weknews.com",
              "description": "2026 증여세, 중개형 ISA 절세, 퇴직금, 예적금 이자 등 필수 금융 도구를 제공하는 플랫폼입니다.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "All"
            })
          }}
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
