import React, { useState, useEffect } from 'react';
import { MarketData } from '../types';
import { TrendingUp, TrendingDown, RefreshCw, Landmark, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MarketWidget: React.FC = () => {
  const [market, setMarket] = useState<MarketData>({
    usdTry: 46.50,
    eurTry: 52.80,
    gbpTry: 61.20,
    goldGramTry: 6030.00,
    usdTryPrev: 46.50,
    eurTryPrev: 52.80,
    gbpTryPrev: 61.20,
    goldGramTryPrev: 6030.00,
    lastUpdated: 'GÜNCELLENİYOR...',
    loading: true,
    error: null,
  });

  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [tickerIndex, setTickerIndex] = useState(0);

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('tr-TR', { hour12: false }));
      setDateStr(
        now.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-world rates
  const fetchRates = async () => {
    try {
      setMarket((prev) => ({ ...prev, loading: true, error: null }));
      
      // Fetch exchange rates
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('API verisi alınamadı');
      
      const data = await res.json();
      const rates = data.rates;
      
      if (rates && rates.TRY) {
        const usdVal = rates.TRY;
        const eurVal = rates.EUR ? usdVal / rates.EUR : 52.80;
        const gbpVal = rates.GBP ? usdVal / rates.GBP : 61.20;
        
        let goldVal = 6030.0; // Updated 2026 target default
        
        // Fetch real-time gold price (USD per ounce) from gold-api.com
        try {
          const goldRes = await fetch('https://api.gold-api.com/price/XAU');
          if (goldRes.ok) {
            const goldData = await goldRes.json();
            if (goldData && goldData.price) {
              const goldOzUsd = goldData.price;
              goldVal = (goldOzUsd / 31.1035) * usdVal;
            }
          }
        } catch (goldErr) {
          console.error('Gold API fetch error, using calculation fallback:', goldErr);
          // Fallback calculation using approximate 4035 USD/oz gold price if API fails
          goldVal = (4035.0 / 31.1035) * usdVal;
        }

        setMarket((prev) => ({
          usdTry: usdVal,
          eurTry: eurVal,
          gbpTry: gbpVal,
          goldGramTry: goldVal,
          usdTryPrev: prev.usdTry || usdVal,
          eurTryPrev: prev.eurTry || eurVal,
          gbpTryPrev: prev.gbpTry || gbpVal,
          goldGramTryPrev: prev.goldGramTry || goldVal,
          lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          loading: false,
          error: null,
        }));
      }
    } catch (err: any) {
      console.error('Exchange rate fetch error:', err);
      setMarket((prev) => ({
        ...prev,
        loading: false,
        lastUpdated: 'Yedek',
      }));
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Micro fluctuation simulation
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setMarket((prev) => {
        const key = ['usd', 'eur', 'gbp', 'gold'][Math.floor(Math.random() * 4)];
        const direction = Math.random() > 0.5 ? 1 : -1;
        const changeAmount = key === 'gold' ? (Math.random() * 0.3 + 0.05) * direction : (Math.random() * 0.005 + 0.001) * direction;

        let nextState = { ...prev };
        if (key === 'usd') {
          nextState.usdTryPrev = prev.usdTry;
          nextState.usdTry = Math.max(25, prev.usdTry + changeAmount);
        } else if (key === 'eur') {
          nextState.eurTryPrev = prev.eurTry;
          nextState.eurTry = Math.max(28, prev.eurTry + changeAmount);
        } else if (key === 'gbp') {
          nextState.gbpTryPrev = prev.gbpTry;
          nextState.gbpTry = Math.max(30, prev.gbpTry + changeAmount);
        } else {
          nextState.goldGramTryPrev = prev.goldGramTry;
          nextState.goldGramTry = Math.max(4000, prev.goldGramTry + changeAmount);
        }
        return nextState;
      });
    }, 4500);

    return () => clearInterval(simulationInterval);
  }, []);

  // Auto scroll ticker index every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Prepare current ticker item
  const getTickerItem = (index: number) => {
    switch (index) {
      case 0:
        return {
          label: 'USD/TRY',
          value: market.usdTry.toFixed(4),
          isUp: market.usdTry >= market.usdTryPrev,
          icon: <Landmark className="w-3.5 h-3.5 text-amber-500" />,
        };
      case 1:
        return {
          label: 'EUR/TRY',
          value: market.eurTry.toFixed(4),
          isUp: market.eurTry >= market.eurTryPrev,
          icon: <Landmark className="w-3.5 h-3.5 text-blue-500" />,
        };
      case 2:
        return {
          label: 'GBP/TRY',
          value: market.gbpTry.toFixed(4),
          isUp: market.gbpTry >= market.gbpTryPrev,
          icon: <Landmark className="w-3.5 h-3.5 text-purple-500" />,
        };
      case 3:
      default:
        return {
          label: 'GRAM ALTIN',
          value: market.goldGramTry.toFixed(2),
          isUp: market.goldGramTry >= market.goldGramTryPrev,
          icon: <Coins className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />,
        };
    }
  };

  const currentItem = getTickerItem(tickerIndex);

  return (
    <div className="flex items-center gap-3 p-2.5 bg-zinc-950/50 backdrop-blur-md rounded-xl border border-zinc-800/40 shadow-lg paper-texture-card w-full md:w-[350px] xl:w-[410px] h-[72px] xl:h-[82px] overflow-hidden select-none">
      
      {/* Clock Area */}
      <div className="flex flex-col justify-center pr-3 border-r border-zinc-800/60 shrink-0 h-full min-w-[100px] xl:min-w-[115px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-lg sm:text-xl xl:text-2xl font-bold tracking-wider text-zinc-100 digital-glow">
            {time.substring(0, 5) || '00:00'}
          </span>
          <span className="font-mono text-[10px] xl:text-[11px] text-zinc-500 self-end mb-[2px]">
            {time.substring(6, 8) || '00'}
          </span>
        </div>
        <span className="text-[9px] xl:text-[10px] font-mono text-zinc-400 tracking-wider font-semibold uppercase mt-0.5">
          {dateStr || '...'}
        </span>
      </div>

      {/* Rolling Ticker Area */}
      <div className="flex-1 flex items-center justify-between pl-1 relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={tickerIndex}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="flex flex-col justify-center h-full w-full"
          >
            <div className="flex items-center gap-1.5 text-[10px] xl:text-[11px] text-zinc-400 font-mono font-bold tracking-wider uppercase mb-0.5">
              {currentItem.icon}
              <span>{currentItem.label}</span>
              {currentItem.isUp ? (
                <TrendingUp className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-rose-400 shrink-0" />
              )}
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className={`text-[16px] xl:text-[19px] font-extrabold tracking-tight ${currentItem.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentItem.value}
              </span>
              <span className="text-[9px] xl:text-[10px] font-bold text-zinc-500">TL</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Refresh Mini Trigger */}
        <button
          onClick={fetchRates}
          title="Yenile"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg border border-zinc-800/50 transition-all cursor-pointer active:scale-90"
        >
          <RefreshCw className={`w-3 h-3 ${market.loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

    </div>
  );
};
