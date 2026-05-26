import Parser from "rss-parser";

export type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

const parser = new Parser({
  timeout: 5000,
  customFields: {
    item: ['source']
  }
});

export async function fetchGoogleNews(query: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
    
    // Use native fetch with a strict 4-second timeout to prevent Vercel build hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour in Next.js
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }
    
    const xml = await response.text();
    const feed = await parser.parseString(xml);
    
    return feed.items.slice(0, limit).map(item => ({
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
