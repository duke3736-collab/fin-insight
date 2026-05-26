import React from "react";
import Link from "next/link";
import Parser from "rss-parser";
import AdSenseBanner from "@/components/AdSenseBanner";
import PWAInstallButton from "@/components/PWAInstallButton";

export const revalidate = 3600; // Revalidate every hour

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

const parser = new Parser({
  customFields: {
    item: ['source']
  }
});

async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`);
    
    return feed.items.slice(0, 5).map(item => ({
      title: item.title?.split(' - ')[0] || item.title || "",
      link: item.link || "",
      pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "",
      source: item.source || item.title?.split(' - ').pop() || "뉴스",
    }));
  } catch (error) {
    console.error(`Error fetching news for ${query}:`, error);
    return [];
  }
}

const CATEGORIES = [
  { id: "economy", title: "📈 경제/금융", query: "경제 OR 금융" },
  { id: "stock", title: "📊 국내증시", query: "국내증시 OR 코스피 OR 코스닥" },
  { id: "global-stock", title: "🌎 해외증시", query: "해외증시 OR 미국증시 OR 나스닥" },
  { id: "crypto", title: "🪙 가상화폐", query: "가상화폐 OR 비트코인 OR 알트코인" },
  { id: "realestate", title: "🏠 부동산 트렌드", query: "부동산 OR 아파트 OR 청약" },
  { id: "grants", title: "💰 정부지원금", query: "정부지원금 OR 보조금 OR 청년도약계좌" },
  { id: "entertainment", title: "✨ 핫이슈/연예", query: "연예 OR 핫이슈" }
];

export default async function DailyNewsPage() {
  // Fetch all categories in parallel
  const newsData = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const items = await fetchGoogleNews(cat.query);
      return { ...cat, items };
    })
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4 px-4 md:px-0">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span className="text-slate-800">오늘의 뉴스 브리핑</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-indigo-500/20 overflow-hidden mx-4 md:mx-0">
        <div className="p-8 md:p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 scale-150 text-8xl">📰</div>
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-sm font-bold tracking-widest uppercase mb-4 border border-indigo-400/30">
              Daily Briefing
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              오늘의 금융 브리핑
            </h1>
            <p className="text-indigo-200/80 text-lg md:text-xl max-w-xl mx-auto font-medium">
              경제, 증시, 부동산부터 가상화폐까지.<br className="hidden md:block" />
              당신이 알아야 할 핵심 트렌드를 1분 만에 확인하세요.
            </p>
            
            {/* PWA Install Promotion */}
            <PWAInstallButton />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-12">
        {newsData.map((category, index) => (
          <React.Fragment key={category.id}>
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{category.title}</h2>
              </div>
              
              <div className="space-y-4">
                {category.items.length > 0 ? (
                  category.items.map((news, i) => (
                    <a 
                      key={i} 
                      href={news.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block p-4 -mx-4 md:mx-0 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 leading-snug">
                        {news.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">{news.source}</span>
                        <span>{news.pubDate}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                  </div>
                )}
              </div>
            </section>
            
            {/* Insert AdSense every 2 categories */}
            {(index + 1) % 2 === 0 && index !== newsData.length - 1 && (
              <div className="mx-auto max-w-3xl">
                <AdSenseBanner dataAdSlot="4122383889" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="px-4 md:px-0">
        <AdSenseBanner dataAdSlot="4122383889" />
      </div>

    </div>
  );
}
