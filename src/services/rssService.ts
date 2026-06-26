export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  type: 'news' | 'info';
}

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];

const isDev = import.meta.env.DEV;

const FEEDS = [
  { name: 'TRT Haber', url: isDev ? '/api/news/trt' : 'https://www.trthaber.com/sondakika.rss' },
  { name: 'NTV', url: isDev ? '/api/news/ntv' : 'https://www.ntv.com.tr/gundem.rss' },
  { name: 'AA', url: isDev ? '/api/news/aa' : 'https://www.aa.com.tr/tr/rss/default?cat=guncel' },
  { name: 'Webtekno', url: isDev ? '/api/news/webtekno' : 'https://www.webtekno.com/rss.xml' },
  { name: 'ShiftDelete', url: isDev ? '/api/news/shiftdelete' : 'https://shiftdelete.net/feed' },
  { name: 'TRT Eğitim', url: isDev ? '/api/news/trt-egitim' : 'https://www.trthaber.com/egitim_articles.rss' },
  { name: 'Habertürk', url: isDev ? '/api/news/haberturk' : 'https://www.haberturk.com/rss' },
  { name: 'CNN Türk', url: isDev ? '/api/news/cnnturk' : 'https://www.cnnturk.com/feed/rss/all/news' },
];

async function fetchWithFallback(targetUrl: string): Promise<string> {
  // If in dev and using local dev proxy, fetch directly from local server
  if (targetUrl.startsWith('/api/')) {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  }

  for (const proxy of PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(targetUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const text = await response.text();
        if (text && (text.includes('<rss') || text.includes('<feed') || text.includes('<xml') || text.includes('<item'))) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Proxy ${proxy} failed for URL ${targetUrl}:`, e);
    }
  }
  throw new Error(`All proxies failed to fetch: ${targetUrl}`);
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') // Remove CDATA wrappers
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const promises = FEEDS.map(async (feed) => {
    try {
      const xmlText = await fetchWithFallback(feed.url);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) throw new Error('XML parsing error');

      const items = xmlDoc.getElementsByTagName('item');
      const entries = xmlDoc.getElementsByTagName('entry');
      const feedItems: NewsItem[] = [];

      if (items.length > 0) {
        // Standard RSS Format (e.g. TRT Haber, Webtekno)
        for (let i = 0; i < Math.min(items.length, 10); i++) {
          const item = items[i];
          const titleNode = item.getElementsByTagName('title')[0];
          const linkNode = item.getElementsByTagName('link')[0];

          if (titleNode && linkNode) {
            const title = cleanText(titleNode.textContent || '');
            const link = cleanText(linkNode.textContent || '');
            
            if (title && link) {
              feedItems.push({
                id: `${feed.name}-${i}-${Date.now()}`,
                title,
                link,
                source: feed.name,
                type: 'news',
              });
            }
          }
        }
      } else if (entries.length > 0) {
        // Atom Feed Format (e.g. NTV)
        for (let i = 0; i < Math.min(entries.length, 10); i++) {
          const entry = entries[i];
          const titleNode = entry.getElementsByTagName('title')[0];
          const linkNode = entry.getElementsByTagName('link')[0];

          if (titleNode && linkNode) {
            const title = cleanText(titleNode.textContent || '');
            // In Atom feeds, the link is usually in the href attribute
            let link = linkNode.getAttribute('href') || linkNode.textContent || '';
            link = cleanText(link);
            
            if (title && link) {
              feedItems.push({
                id: `${feed.name}-${i}-${Date.now()}`,
                title,
                link,
                source: feed.name,
                type: 'news',
              });
            }
          }
        }
      }
      return feedItems;
    } catch (error) {
      console.warn(`Failed to fetch RSS feed for ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  const allNews: NewsItem[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });

  // Interleave and randomize feeds slightly to provide a rich feed mix
  return shuffleArray(allNews);
}

function shuffleArray(array: NewsItem[]): NewsItem[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
