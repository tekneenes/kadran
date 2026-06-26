import React from 'react';
import { NewsItem } from '../services/rssService';

interface NewsTickerProps {
  news: NewsItem[];
  loading: boolean;
  isNewsDisabled?: boolean;
}

const infoItems = [
  "🔒 Verileriniz tarayıcınızda güvendedir",
  "ℹ️ Fiyatlar serbest piyasa kurlarına dayanır",
  "© 2026 KADRAN • Retro Flip Timer"
];

export const NewsTicker: React.FC<NewsTickerProps> = ({ news, loading, isNewsDisabled }) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePause = () => {
    setIsPaused(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleResumeWithDelay = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Automatically resume after 5 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      timeoutRef.current = null;
    }, 5000);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getCombinedItems = (): NewsItem[] => {
    if (isNewsDisabled || news.length === 0) {
      // Fallback if news failed to load or is disabled
      return infoItems.map((text, idx) => ({
        id: `info-${idx}`,
        title: text,
        link: '',
        source: 'KADRAN',
        type: 'info'
      }));
    }

    const combined: NewsItem[] = [];
    let infoIndex = 0;

    for (let i = 0; i < news.length; i++) {
      combined.push(news[i]);
      // Interleave one system info item every 8 news items
      if ((i + 1) % 8 === 0) {
        const infoText = infoItems[infoIndex % infoItems.length];
        combined.push({
          id: `info-${i}-${infoIndex}`,
          title: infoText,
          link: '',
          source: 'KADRAN',
          type: 'info',
        });
        infoIndex++;
      }
    }

    // In case we have less than 8 news items, make sure we append at least one info item
    if (combined.length > 0 && infoIndex === 0) {
      combined.push({
        id: `info-end`,
        title: infoItems[0],
        link: '',
        source: 'KADRAN',
        type: 'info',
      });
    }

    return combined;
  };

  const getSourceStyles = (source: string) => {
    switch (source.toLowerCase()) {
      case 'trt haber':
      case 'trt eğitim':
        return 'text-red-400 bg-red-950/30 border-red-900/40';
      case 'ntv':
        return 'text-blue-400 bg-blue-950/30 border-blue-900/40';
      case 'aa':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40';
      case 'webtekno':
        return 'text-indigo-400 bg-indigo-950/30 border-indigo-900/40';
      case 'shiftdelete':
        return 'text-amber-500 bg-amber-950/30 border-amber-900/40';
      case 'habertürk':
        return 'text-cyan-400 bg-cyan-950/30 border-cyan-900/40';
      case 'cnn türk':
        return 'text-rose-400 bg-rose-950/30 border-rose-900/40';
      default:
        return 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40';
    }
  };

  const combinedItems = getCombinedItems();

  const renderItem = (item: NewsItem) => {
    if (item.type === 'info') {
      return (
        <div 
          key={item.id} 
          className="flex items-center text-xs font-mono text-amber-500/85 tracking-wide font-medium shrink-0 gap-2 select-none"
        >
          <span>{item.title}</span>
          <span className="text-zinc-800 mx-5 select-none">|</span>
        </div>
      );
    }

    return (
      <a
        key={item.id}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors duration-200 cursor-pointer shrink-0 group text-xs font-mono"
      >
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border tracking-wider uppercase shrink-0 transition-colors duration-200 ${getSourceStyles(item.source)}`}>
          {item.source}
        </span>
        <span className="group-hover:underline tracking-tight select-none leading-none">
          {item.title}
        </span>
        <span className="text-zinc-800 mx-5 group-hover:text-zinc-700 select-none">|</span>
      </a>
    );
  };

  if (isNewsDisabled) {
    return (
      <div className="w-full flex items-center justify-center bg-zinc-950/30 border-y border-zinc-900/60 h-12 overflow-hidden select-none px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
          {infoItems.map((text, idx) => (
            <React.Fragment key={`info-static-${idx}`}>
              <div className="flex items-center text-xs font-mono text-amber-500/85 tracking-wide font-medium select-none">
                <span>{text}</span>
              </div>
              {idx < infoItems.length - 1 && (
                <span className="text-zinc-800 hidden sm:inline select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full flex items-center bg-zinc-950/30 border-y border-zinc-900/60 h-12 overflow-hidden select-none"
      onMouseEnter={handlePause}
      onMouseLeave={handleResumeWithDelay}
      onTouchStart={handlePause}
      onTouchEnd={handleResumeWithDelay}
    >
      {/* Fixed News Badge */}
      <div className="flex items-center gap-2 px-4 h-full bg-zinc-950 border-r border-zinc-900 font-mono text-xs font-bold tracking-wider z-20 shrink-0 select-none text-red-500">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        HABER AKIŞI
      </div>

      {/* Scrolling Container */}
      <div className="flex-1 overflow-hidden relative z-10 flex items-center h-full">
        {loading ? (
          <div className="px-4 text-xs font-mono text-zinc-600 uppercase tracking-widest animate-pulse select-none">
            Haber akışı güncelleniyor...
          </div>
        ) : (
          <div 
            className="animate-marquee gap-1 items-center"
            style={{ 
              '--marquee-duration': `${Math.max(50, combinedItems.length * 4)}s`,
              animationPlayState: isPaused ? 'paused' : 'running'
            } as React.CSSProperties}
          >
            {/* Render items twice to build a seamless marquee loop */}
            {combinedItems.map((item) => renderItem(item))}
            {combinedItems.map((item) => renderItem({ ...item, id: `${item.id}-dup` }))}
          </div>
        )}
      </div>
    </div>
  );
};
