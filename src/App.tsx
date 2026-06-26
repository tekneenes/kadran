import React, { useState, useEffect } from 'react';
import { MarketWidget } from './components/MarketWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { Timer } from './components/Timer';
import { SettingsDialog } from './components/SettingsDialog';
import { NewsTicker } from './components/NewsTicker';
import { fetchAllNews, NewsItem } from './services/rssService';

export default function App() {
  const [isTickingEnabled, setIsTickingEnabled] = useState(() => {
    return localStorage.getItem('isTickingEnabled') === 'true';
  });
  const [ambientSound, setAmbientSound] = useState<'none' | 'white' | 'rain'>(() => {
    const saved = localStorage.getItem('ambientSound');
    return (saved === 'white' || saved === 'rain') ? saved : 'none';
  });
  const [isNewsDisabled, setIsNewsDisabled] = useState(() => {
    return localStorage.getItem('isNewsDisabled') === 'true';
  });
  const [keepFooterVisible, setKeepFooterVisible] = useState(() => {
    return localStorage.getItem('keepFooterVisible') === 'true';
  });
  const [inactivityBehavior, setInactivityBehavior] = useState<'full' | 'minimal'>(() => {
    const saved = localStorage.getItem('inactivityBehavior');
    return (saved === 'minimal') ? 'minimal' : 'full';
  });
  const [countdownWarning, setCountdownWarning] = useState<'off' | '5' | '10'>(() => {
    const saved = localStorage.getItem('countdownWarning');
    return (saved === 'off' || saved === '5' || saved === '10') ? saved : '10';
  });
  const [alarmSound, setAlarmSound] = useState<'classic' | 'cool'>(() => {
    const saved = localStorage.getItem('alarmSound');
    return (saved === 'classic' || saved === 'cool') ? saved : 'cool';
  });
  const [warningBeep, setWarningBeep] = useState<boolean>(() => {
    const saved = localStorage.getItem('warningBeep');
    return saved !== 'false'; // default to true
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  // Settings persistence
  useEffect(() => {
    localStorage.setItem('isTickingEnabled', String(isTickingEnabled));
  }, [isTickingEnabled]);

  useEffect(() => {
    localStorage.setItem('ambientSound', ambientSound);
  }, [ambientSound]);

  useEffect(() => {
    localStorage.setItem('isNewsDisabled', String(isNewsDisabled));
  }, [isNewsDisabled]);

  useEffect(() => {
    localStorage.setItem('keepFooterVisible', String(keepFooterVisible));
  }, [keepFooterVisible]);

  useEffect(() => {
    localStorage.setItem('inactivityBehavior', inactivityBehavior);
  }, [inactivityBehavior]);

  useEffect(() => {
    localStorage.setItem('countdownWarning', countdownWarning);
  }, [countdownWarning]);

  useEffect(() => {
    localStorage.setItem('alarmSound', alarmSound);
  }, [alarmSound]);

  useEffect(() => {
    localStorage.setItem('warningBeep', String(warningBeep));
  }, [warningBeep]);

  // Fetch news on mount and refresh every 15 minutes (only if news is enabled)
  useEffect(() => {
    if (isNewsDisabled) {
      setNews([]);
      setIsNewsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadNews() {
      try {
        setIsNewsLoading(true);
        const data = await fetchAllNews();
        if (isMounted) {
          setNews(data);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        if (isMounted) {
          setIsNewsLoading(false);
        }
      }
    }
    
    loadNews();
    const interval = setInterval(loadNews, 15 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isNewsDisabled]);

  const [isImmersive, setIsImmersive] = useState(false);

  // Inactivity tracking for immersive mode (10s of no movement triggers immersive mode when timer is active)
  useEffect(() => {
    if (!isTimerActive) {
      setIsImmersive(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimeout = () => {
      setIsImmersive(false);
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsImmersive(true);
      }, 10000); // 10 seconds
    };

    // Initialize/reset on start
    resetInactivityTimeout();

    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'touchstart', 'touchmove', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimeout);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimeout);
      });
    };
  }, [isTimerActive]);

  // Automatically hide the footer 5 seconds after starting the timer (unless keepFooterVisible is true)
  // In full immersive mode, always hide it. In minimal immersive mode, keep it visible.
  useEffect(() => {
    if (isImmersive && inactivityBehavior === 'full') {
      setShowFooter(false);
      return;
    }
    if (isImmersive && inactivityBehavior === 'minimal') {
      setShowFooter(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    if (isTimerActive && !keepFooterVisible) {
      timeoutId = setTimeout(() => {
        setShowFooter(false);
      }, 5000);
    } else {
      setShowFooter(true);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isTimerActive, keepFooterVisible, isImmersive, inactivityBehavior]);

  const immersiveMode = !isImmersive ? 'none' : inactivityBehavior;

  return (
    <div className={`h-screen max-h-screen w-full text-zinc-100 paper-texture-dark flex flex-col justify-between relative overflow-hidden select-none transition-all duration-700 ease-in-out ${
      isImmersive ? 'cursor-none' : ''
    }`}>
      {/* Decorative Warm Ambient Glow Overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/3.5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Section (Widgets) */}
      <header className={`w-full max-w-[96%] mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-4 z-10 shrink-0 transition-all duration-700 ease-in-out ${
        immersiveMode === 'full'
          ? '-translate-y-full opacity-0 pointer-events-none max-h-0 py-0 my-0 overflow-hidden'
          : 'translate-y-0 opacity-100 max-h-40 py-3 md:py-5'
      }`}>
        {/* Top Left: Markets & Clock */}
        <div className="w-full md:w-auto animate-[fadeIn_0.6s_ease-out]">
          <MarketWidget />
        </div>

        {/* Brand / Logo */}
        <div className="hidden lg:flex items-center gap-3 px-4 self-center select-none">
          <svg className="w-10 h-10 text-amber-500 shrink-0" viewBox="0 0 100 100" fill="none">
            {/* Rounded retro flip card container */}
            <rect x="15" y="10" width="70" height="80" rx="12" fill="#1c1d1f" stroke="#2e3033" strokeWidth="2" />
            
            {/* Top half darker background */}
            <path d="M15 10 h70 v40 h-70 Z" fill="#121314" clipPath="inset(0 0 0 0 round 12px 12px 0 0)" />
            
            {/* Inner split hinge line shadow */}
            <line x1="15" y1="50" x2="85" y2="50" stroke="#000" strokeWidth="3" />
            <line x1="15" y1="50" x2="85" y2="50" stroke="#121314" strokeWidth="1" />
            
            {/* Metal hinges on the left and right sides of the hinge line */}
            <rect x="12" y="44" width="6" height="12" rx="1.5" fill="#0d0e0f" stroke="#27272a" strokeWidth="0.5" />
            <rect x="82" y="44" width="6" height="12" rx="1.5" fill="#0d0e0f" stroke="#27272a" strokeWidth="0.5" />
            
            {/* Font display of K (Split in the middle) */}
            {/* Top half of K */}
            <path d="M38 24 v24 M58 24 L42 43 M46 38 L58 48" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            <path d="M38 24 v24 M58 24 L42 43 M46 38 L58 48" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Bottom half of K */}
            <path d="M38 52 v24 M42 52 L58 76" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            <path d="M38 52 v24 M42 52 L58 76" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Subtle screen glare/gradient reflection */}
            <path d="M20 15 L80 15 L25 45 Z" fill="url(#glare-gradient-header)" opacity="0.08" />
            
            <defs>
              <linearGradient id="glare-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-start text-left">
            <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-100 leading-none">
              KADRAN
            </h1>
          </div>
        </div>

        {/* Top Right: Weather Widget */}
        <div className="w-full md:w-auto flex justify-end animate-[fadeIn_0.6s_ease-out_0.1s_both]">
          <WeatherWidget onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
      </header>

      {/* Main Focus Dashboard Arena */}
      <main className="flex-1 w-full max-w-[96%] mx-auto px-4 py-2 md:py-4 flex flex-col items-center justify-center gap-4 md:gap-6 z-10 min-h-0 overflow-hidden">
        {/* Core Flip Clock Timer */}
        <section className="w-full flex justify-center animate-[fadeIn_0.8s_ease-out_0.2s_both]">
          <Timer 
            isTickingEnabled={isTickingEnabled} 
            setIsTickingEnabled={setIsTickingEnabled}
            ambientSound={ambientSound}
            setAmbientSound={setAmbientSound}
            onActiveChange={setIsTimerActive}
            immersiveMode={immersiveMode}
            countdownWarning={countdownWarning}
            alarmSound={alarmSound}
            warningBeep={warningBeep}
          />
        </section>
      </main>

    <div className="w-full overflow-hidden shrink-0">
      <footer className={`w-full z-10 transition-all duration-700 ease-in-out ${
        showFooter 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <NewsTicker news={news} loading={isNewsLoading} isNewsDisabled={isNewsDisabled} />
      </footer>
    </div>

      {/* Settings Dialog Overlay */}
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        isTickingEnabled={isTickingEnabled}
        setIsTickingEnabled={setIsTickingEnabled}
        ambientSound={ambientSound}
        setAmbientSound={setAmbientSound}
        isNewsDisabled={isNewsDisabled}
        setIsNewsDisabled={setIsNewsDisabled}
        keepFooterVisible={keepFooterVisible}
        setKeepFooterVisible={setKeepFooterVisible}
        inactivityBehavior={inactivityBehavior}
        setInactivityBehavior={setInactivityBehavior}
        countdownWarning={countdownWarning}
        setCountdownWarning={setCountdownWarning}
        alarmSound={alarmSound}
        setAlarmSound={setAlarmSound}
        warningBeep={warningBeep}
        setWarningBeep={setWarningBeep}
      />
    </div>
  );
}
