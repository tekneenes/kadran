import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface FlipDigitProps {
  value: number;
  label: string;
  isThreeDigit?: boolean;
  immersiveMode?: 'none' | 'full' | 'minimal';
  isWarningActive?: boolean;
}

export const FlipDigit: React.FC<FlipDigitProps> = ({ 
  value, 
  label, 
  isThreeDigit = false,
  immersiveMode = 'none',
  isWarningActive = false,
}) => {
  // Pad value to 2 digits (e.g. 9 -> "09")
  const displayVal = value.toString().padStart(2, '0');
  const [currentVal, setCurrentVal] = useState(displayVal);
  const [prevVal, setPrevVal] = useState(displayVal);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (displayVal !== currentVal) {
      setPrevVal(currentVal);
      setCurrentVal(displayVal);
      setFlipKey((prev) => prev + 1);
    }
  }, [displayVal, currentVal]);

  const cardStyle: React.CSSProperties = {
    width: isThreeDigit 
      ? (immersiveMode === 'full' 
          ? 'clamp(85px, min(70vmin, 27vw), 1000px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(85px, min(60vmin, 27vw), 900px)' 
          : 'clamp(85px, min(48vmin, 28vw), 800px)')
      : (immersiveMode === 'full' 
          ? 'clamp(120px, min(68vmin, 42vw), 1200px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(120px, min(58vmin, 42vw), 1000px)' 
          : 'clamp(120px, min(48vmin, 41vw), 800px)'),
    height: isThreeDigit 
      ? (immersiveMode === 'full' 
          ? 'clamp(100px, min(82vmin, 31.6vw), 1200px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(100px, min(70vmin, 31.6vw), 1100px)' 
          : 'clamp(100px, min(58vmin, 34vw), 960px)')
      : (immersiveMode === 'full' 
          ? 'clamp(145px, min(82vmin, 50.5vw), 1400px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(145px, min(70vmin, 50.5vw), 1200px)' 
          : 'clamp(145px, min(58vmin, 50vw), 960px)'),
    borderRadius: isThreeDigit 
      ? (immersiveMode === 'full' 
          ? 'clamp(10px, min(7.5vmin, 3.2vw), 80px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(10px, min(6.5vmin, 3.2vw), 74px)' 
          : 'clamp(10px, min(5.5vmin, 3.2vw), 68px)')
      : (immersiveMode === 'full' 
          ? 'clamp(16px, min(7.5vmin, 4.6vw), 80px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(16px, min(6.5vmin, 4.6vw), 74px)' 
          : 'clamp(16px, min(5.5vmin, 4.6vw), 68px)'),
    perspective: '1200px',
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const textStyle: React.CSSProperties = {
    fontSize: isThreeDigit 
      ? (immersiveMode === 'full' 
          ? 'clamp(55px, min(49vmin, 18.9vw), 850px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(55px, min(42vmin, 18.9vw), 750px)' 
          : 'clamp(55px, min(34vmin, 19.6vw), 650px)')
      : (immersiveMode === 'full' 
          ? 'clamp(85px, min(47.5vmin, 29.5vw), 1000px)' 
          : immersiveMode === 'minimal' 
          ? 'clamp(85px, min(40.5vmin, 29.5vw), 850px)' 
          : 'clamp(85px, min(34vmin, 29vw), 650px)'),
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  };

  const rVal = isThreeDigit 
    ? (immersiveMode === 'full' 
        ? 'clamp(10px, min(7.5vmin, 3.2vw), 80px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(10px, min(6.5vmin, 3.2vw), 74px)' 
        : 'clamp(10px, min(5.5vmin, 3.2vw), 68px)')
    : (immersiveMode === 'full' 
        ? 'clamp(16px, min(7.5vmin, 4.6vw), 80px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(16px, min(6.5vmin, 4.6vw), 74px)' 
        : 'clamp(16px, min(5.5vmin, 4.6vw), 68px)');

  const elementTransition: React.CSSProperties = {
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const isImmersive = immersiveMode !== 'none';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Label above card */}
      <span 
        className="font-mono tracking-widest text-zinc-500 uppercase font-semibold text-center select-none transition-all duration-700 ease-in-out"
        style={{
          fontSize: isImmersive ? 'clamp(8px, 1.5vmin, 16px)' : 'clamp(8px, 1.2vmin, 14px)',
          marginBottom: isImmersive ? 'clamp(6px, 2vmin, 16px)' : 'clamp(6px, 1.5vmin, 12px)',
        }}
      >
        {label}
      </span>

      {/* Main Flip Card Container */}
      <div 
        className={`relative bg-zinc-950 shadow-2xl overflow-hidden paper-texture-card flex flex-col transition-all duration-700 ease-in-out border ${
          isWarningActive 
            ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
            : 'border-zinc-800/60'
        }`}
        style={cardStyle}
      >
        {/* UPPER STATIC HALF (shows new top half) */}
        <div 
          className="relative w-full h-1/2 overflow-hidden bg-zinc-900 border-b border-black/40"
          style={{
            ...elementTransition,
            borderRadius: `${rVal} ${rVal} 0 0`,
          }}
        >
          <div 
            className={`absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-display font-bold leading-none tracking-normal transition-all duration-700 ease-in-out ${
              isWarningActive 
                ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.95)]' 
                : 'text-zinc-200'
            }`}
            style={textStyle}
          >
            {currentVal}
          </div>
          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/5 pointer-events-none" />
        </div>

        {/* LOWER STATIC HALF (shows old bottom half) */}
        <div 
          className="relative w-full h-1/2 overflow-hidden bg-[#18191b]"
          style={{
            ...elementTransition,
            borderRadius: `0 0 ${rVal} ${rVal}`,
          }}
        >
          <div 
            className={`absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center font-display font-bold leading-none tracking-normal transition-all duration-700 ease-in-out ${
              isWarningActive 
                ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.95)]' 
                : 'text-zinc-300'
            }`}
            style={textStyle}
          >
            {prevVal}
          </div>
          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* THE FLIPPING FLAP (animates from top to bottom) */}
        <motion.div
          key={flipKey}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -180 }}
          transition={{
            type: 'spring',
            stiffness: 95,
            damping: 14,
            mass: 0.85,
          }}
          style={{
            transformOrigin: 'bottom',
            transformStyle: 'preserve-3d',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            zIndex: 10,
          }}
        >
          {/* Front Face of Flap (Shows old top half) */}
          <div
            className="absolute inset-0 overflow-hidden bg-zinc-900 border-b border-black/40"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: `${rVal} ${rVal} 0 0`,
              ...elementTransition,
            }}
          >
            <div 
              className={`absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-display font-bold leading-none tracking-normal transition-all duration-700 ease-in-out ${
                isWarningActive 
                  ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.95)]' 
                  : 'text-zinc-300'
              }`}
              style={textStyle}
            >
              {prevVal}
            </div>
            {/* Ambient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Back Face of Flap (Shows new bottom half) */}
          <div
            className="absolute inset-0 overflow-hidden bg-[#18191b]"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              borderRadius: `0 0 ${rVal} ${rVal}`,
              ...elementTransition,
            }}
          >
            <div 
              className={`absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center font-display font-bold leading-none tracking-normal transition-all duration-700 ease-in-out ${
                isWarningActive 
                  ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.95)]' 
                  : 'text-zinc-200'
              }`}
              style={textStyle}
            >
              {currentVal}
            </div>
            {/* Highlight shadow when falling */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Hinge Line Separator (With physical hinges on sides) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-zinc-950/90 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.6)] flex items-center justify-between pointer-events-none transition-all duration-700 ease-in-out">
          <div 
            className="bg-zinc-950 rounded-r border border-zinc-800 -ml-[1px] transition-all duration-700 ease-in-out"
            style={{
              width: isThreeDigit 
                ? (immersiveMode === 'full' ? 'clamp(4px, 1.2vmin, 12px)' : immersiveMode === 'minimal' ? 'clamp(4px, 1vmin, 10px)' : 'clamp(4px, 0.8vmin, 8px)')
                : (immersiveMode === 'full' ? 'clamp(6px, 1.8vmin, 18px)' : immersiveMode === 'minimal' ? 'clamp(6px, 1.5vmin, 15px)' : 'clamp(6px, 1.2vmin, 12px)'),
              height: isThreeDigit 
                ? (immersiveMode === 'full' ? 'clamp(10px, 3.2vmin, 30px)' : immersiveMode === 'minimal' ? 'clamp(10px, 2.7vmin, 25px)' : 'clamp(10px, 2.2vmin, 20px)')
                : (immersiveMode === 'full' ? 'clamp(14px, 4.5vmin, 42px)' : immersiveMode === 'minimal' ? 'clamp(14px, 3.8vmin, 35px)' : 'clamp(14px, 3vmin, 28px)'),
            }}
          />
          <div 
            className="bg-zinc-950 rounded-l border border-zinc-800 -mr-[1px] transition-all duration-700 ease-in-out"
            style={{
              width: isThreeDigit 
                ? (immersiveMode === 'full' ? 'clamp(4px, 1.2vmin, 12px)' : immersiveMode === 'minimal' ? 'clamp(4px, 1vmin, 10px)' : 'clamp(4px, 0.8vmin, 8px)')
                : (immersiveMode === 'full' ? 'clamp(6px, 1.8vmin, 18px)' : immersiveMode === 'minimal' ? 'clamp(6px, 1.5vmin, 15px)' : 'clamp(6px, 1.2vmin, 12px)'),
              height: isThreeDigit 
                ? (immersiveMode === 'full' ? 'clamp(10px, 3.2vmin, 30px)' : immersiveMode === 'minimal' ? 'clamp(10px, 2.7vmin, 25px)' : 'clamp(10px, 2.2vmin, 20px)')
                : (immersiveMode === 'full' ? 'clamp(14px, 4.5vmin, 42px)' : immersiveMode === 'minimal' ? 'clamp(14px, 3.8vmin, 35px)' : 'clamp(14px, 3vmin, 28px)'),
            }}
          />
        </div>

        {/* Subtle overall card glow & inner bevel shadow */}
        <div 
          className="absolute inset-0 border border-white/[0.03] pointer-events-none shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-700 ease-in-out"
          style={{ borderRadius: rVal }}
        />
      </div>
    </div>
  );
};
