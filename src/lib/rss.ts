import Parser from "rss-parser";

export type NewsItem = {
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

export async function fetchGoogleNews(query: string, limit: number = 5): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`);
    
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
