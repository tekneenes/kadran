import React, { useState, useEffect, useRef } from 'react';
import { FlipDigit } from './FlipDigit';
import { TimerMode } from '../types';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Coffee, Clock } from 'lucide-react';

const basePresets: number[] = [];
// 1 to 59:
for (let i = 1; i <= 59; i++) {
  basePresets.push(i);
}
// 60 to 300 (5 hours) in increments of 10:
for (let i = 60; i <= 300; i += 10) {
  basePresets.push(i);
}
const presets = [...basePresets, ...basePresets, ...basePresets];

interface TimerProps {
  isTickingEnabled: boolean;
  setIsTickingEnabled: (val: boolean) => void;
  ambientSound: 'none' | 'white' | 'rain';
  setAmbientSound: (val: 'none' | 'white' | 'rain') => void;
  onActiveChange?: (active: boolean) => void;
  immersiveMode?: 'none' | 'full' | 'minimal';
  countdownWarning?: 'off' | '5' | '10';
  alarmSound?: 'classic' | 'cool';
  warningBeep?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  isTickingEnabled,
  setIsTickingEnabled,
  ambientSound,
  setAmbientSound,
  onActiveChange,
  immersiveMode = 'none',
  countdownWarning = '10',
  alarmSound = 'cool',
  warningBeep = true,
}) => {
  const [mode, setMode] = useState<TimerMode>('custom');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Custom setup states
  const [customHour, setCustomHour] = useState(0);
  const [customMin, setCustomMin] = useState(25);

  // Quick Preset Scroll Wheel States
  const [wheelIndex, setWheelIndex] = useState(basePresets.length + 24); // Start at 25 in the middle copy
  const [isDraggingState, setIsDraggingState] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag-to-scroll refs
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Scroll to index helper
  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mathematical grid coordinate: each item is 56px wide, spacers are 112px.
    // To align item 'index' in the center of the 280px container, we scroll to exactly index * 56.
    const targetScrollLeft = index * 56;
    container.scrollTo({
      left: targetScrollLeft,
      behavior,
    });

    // Update state instantly so the visual elements (green active, flip digits) respond immediately to clicks
    setWheelIndex(index);
    playWheelClickSound();
    const val = presets[index];
    if (!isActive) {
      setMode('custom');
      const h = Math.floor(val / 60);
      const m = val % 60;
      setHours(h);
      setMinutes(m);
      setCustomHour(h);
      setCustomMin(m);
      setSeconds(0);
      setIsDirty(false);
    }
  };

  // Handle manual/trackpad scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Calculate the closest index mathematically based on our 56px grid
    const scrollLeft = container.scrollLeft;
    let closestIndex = Math.max(0, Math.min(presets.length - 1, Math.round(scrollLeft / 56)));
    
    // Silent infinite snapping
    if (closestIndex < basePresets.length) {
      const shift = basePresets.length * 56;
      container.scrollLeft += shift;
      if (isDragging.current) {
        dragScrollLeft.current += shift;
      }
      closestIndex += basePresets.length;
    } else if (closestIndex >= basePresets.length * 2) {
      const shift = basePresets.length * 56;
      container.scrollLeft -= shift;
      if (isDragging.current) {
        dragScrollLeft.current -= shift;
      }
      closestIndex -= basePresets.length;
    }
    
    if (closestIndex !== wheelIndex) {
      setWheelIndex(closestIndex);
      playWheelClickSound();
      const val = presets[closestIndex];
      if (!isActive) {
        setMode('custom');
        const h = Math.floor(val / 60);
        const m = val % 60;
        setHours(h);
        setMinutes(m);
        setCustomHour(h);
        setCustomMin(m);
        setSeconds(0);
        setIsDirty(false);
      }
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (!isDragging.current) {
      scrollTimeoutRef.current = setTimeout(() => {
        const currentScroll = scrollContainerRef.current?.scrollLeft ?? 0;
        if (Math.abs(currentScroll - closestIndex * 56) >= 1) {
          scrollToIndex(closestIndex, 'smooth');
        }
      }, 150);
    }
  };

  // Convert vertical and horizontal wheel scrolls in the carousel with precision multiplier
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const onWheelEvent = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 1.5;
      }
    };
    
    container.addEventListener('wheel', onWheelEvent, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelEvent);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Initialize and center wheel on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToIndex(wheelIndex, 'auto');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync wheel when mode changes
  useEffect(() => {
    let targetMinutes = 25;
    if (mode === 'focus') {
      targetMinutes = 25;
    } else if (mode === 'break') {
      targetMinutes = 5;
    } else if (mode === 'custom') {
      targetMinutes = customHour * 60 + customMin;
    }
    
    const baseIdx = basePresets.indexOf(targetMinutes);
    const presetIdx = baseIdx !== -1 ? baseIdx + basePresets.length : -1;
    if (presetIdx !== -1 && presetIdx !== wheelIndex) {
      setWheelIndex(presetIdx);
      const timer = setTimeout(() => {
        scrollToIndex(presetIdx, 'smooth');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'custom' && !isActive) {
      const totalMinutes = customHour * 60 + customMin;
      const baseIdx = basePresets.indexOf(totalMinutes);
      const presetIdx = baseIdx !== -1 ? baseIdx + basePresets.length : -1;
      if (presetIdx !== -1 && presetIdx !== wheelIndex) {
        setWheelIndex(presetIdx);
        scrollToIndex(presetIdx, 'smooth');
      }
    }
  }, [customHour, customMin]);

  // Notify parent component about active state changes
  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  // Web Audio Context reference for synthesizers
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const noiseFilterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Synchronize base values based on modes
  useEffect(() => {
    if (!isActive && !isDirty) {
      if (mode === 'focus') {
        setHours(0);
        setMinutes(25);
        setSeconds(0);
      } else if (mode === 'break') {
        setHours(0);
        setMinutes(5);
        setSeconds(0);
      } else if (mode === 'custom') {
        setHours(customHour);
        setMinutes(customMin);
        setSeconds(0);
      }
    }
  }, [mode, customHour, customMin, isActive, isDirty]);

  // Audio Context lazy init
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play synthetic retro bell upon completion
  const playCompletionSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Chime 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // Chime 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 3);
      osc2.start(now + 0.15);
      osc2.stop(now + 3);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

  // Play modern cool rhythmic chime (dın dın dın) upon completion
  const playCoolChime = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const triggerPulse = (time: number, freq: number, duration: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        // Sub-oscillator for warmth
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq / 2, time);
        const subGain = ctx.createGain();
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(vol, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        subGain.gain.setValueAtTime(0, time);
        subGain.gain.linearRampToValueAtTime(vol * 0.45, time + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.8);
        
        osc.connect(gainNode);
        subOsc.connect(subGain);
        
        gainNode.connect(ctx.destination);
        subGain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration + 0.15);
        subOsc.start(time);
        subOsc.stop(time + duration + 0.15);
      };
      
      triggerPulse(now, 659.25, 0.45, 0.28); // E5
      triggerPulse(now + 0.32, 659.25, 0.45, 0.28); // E5
      triggerPulse(now + 0.64, 987.77, 1.4, 0.32); // B5 (longer decay)
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

  // Play synthetic analog clock tick
  const playTickSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignore audio block errors
    }
  };

  // Play short synthesized electronic chime ("dın") during warning countdown
  const playWarningBeep = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // Ignore
    }
  };

  // Play subtle physical wheel mechanical tick
  const playWheelClickSound = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.006, now); // very subtle
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {
      // Ignore audio block errors
    }
  };

  // Synthesize ambient noise (White Noise or Rain filter)
  const startAmbientNoise = (type: 'white' | 'rain') => {
    stopAmbientNoise();
    try {
      const ctx = getAudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate White Noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter Node
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        // Low pass filter for warm rain splash
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);
      } else {
        // Soft white noise filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(type === 'rain' ? 0.08 : 0.02, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      // Store refs to stop later
      noiseNodeRef.current = whiteNoise as any;
      noiseFilterNodeRef.current = filter;
    } catch (e) {
      console.warn('Could not start ambient noise', e);
    }
  };

  const stopAmbientNoise = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    noiseFilterNodeRef.current = null;
  };

  // Ambient sound handler toggle
  useEffect(() => {
    if (isActive && ambientSound !== 'none') {
      startAmbientNoise(ambientSound);
    } else {
      stopAmbientNoise();
    }
    return () => stopAmbientNoise();
  }, [ambientSound, isActive]);

  // Main countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        const warningThreshold = countdownWarning === 'off' ? 0 : parseInt(countdownWarning, 10);
        const isWarningTick = hours === 0 && minutes === 0 && seconds > 0 && seconds <= warningThreshold;

        if (seconds > 0) {
          setSeconds((s) => s - 1);
          if (isWarningTick && warningBeep) {
            playWarningBeep();
          } else if (isTickingEnabled) {
            playTickSound();
          }
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
          if (isTickingEnabled) {
            playTickSound();
          }
        } else if (hours > 0) {
          setHours((h) => h - 1);
          setMinutes(59);
          setSeconds(59);
          if (isTickingEnabled) {
            playTickSound();
          }
        } else {
          // Timer finished!
          setIsActive(false);
          setIsDirty(false);
          if (alarmSound === 'cool') {
            playCoolChime();
          } else {
            playCompletionSound();
          }
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, hours, minutes, seconds, isTickingEnabled]);

  const toggleTimer = () => {
    // Init audio on user gesture
    getAudioContext();
    if (!isActive) {
      setIsDirty(true);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsDirty(false);
    stopAmbientNoise();
    setHours(customHour);
    setMinutes(customMin);
    setSeconds(0);
  };

  const isThreeDigit = mode === 'custom' && hours > 0;
  const isImmersive = immersiveMode !== 'none';

  const dotSize = isThreeDigit 
    ? (immersiveMode === 'full' 
        ? 'clamp(6px, min(3vmin, 1.3vw), 35px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(6px, min(2.6vmin, 1.3vw), 30px)' 
        : 'clamp(6px, min(2.2vmin, 1.3vw), 26px)')
    : (immersiveMode === 'full' 
        ? 'clamp(10px, min(5vmin, 3vw), 45px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(10px, min(4.2vmin, 3vw), 38px)' 
        : 'clamp(10px, min(3.5vmin, 2.6vw), 32px)');

  const dotGap = isThreeDigit 
    ? (immersiveMode === 'full' 
        ? 'clamp(8px, min(4.5vmin, 1.8vw), 70px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(8px, min(3.8vmin, 1.8vw), 60px)' 
        : 'clamp(8px, min(3.2vmin, 2vw), 48px)')
    : (immersiveMode === 'full' 
        ? 'clamp(12px, min(7vmin, 4vw), 120px)' 
        : immersiveMode === 'minimal' 
        ? 'clamp(12px, min(6vmin, 4vw), 100px)' 
        : 'clamp(12px, min(5vmin, 3.8vw), 72px)');

  const warningThreshold = countdownWarning === 'off' ? 0 : parseInt(countdownWarning, 10);
  const isWarningActive = isActive && hours === 0 && minutes === 0 && seconds > 0 && seconds <= warningThreshold;

  return (
    <div 
      className="flex flex-col items-center justify-center w-full transition-all duration-700 ease-in-out"
      style={{ gap: isImmersive ? '0px' : 'clamp(20px, 5.5vmin, 76px)' }}
    >
      {/* Huge Interactive Flip Clock Display */}
      <div 
        className="flex items-center justify-center select-none w-full h-auto transition-all duration-700 ease-in-out"
        style={{
          gap: isThreeDigit 
            ? (immersiveMode === 'full' 
                ? 'clamp(8px, min(4.5vmin, 1.8vw), 70px)' 
                : immersiveMode === 'minimal' 
                ? 'clamp(8px, min(3.8vmin, 1.8vw), 60px)' 
                : 'clamp(8px, min(3vmin, 1.8vw), 48px)')
            : (immersiveMode === 'full' 
                ? 'clamp(12px, min(7vmin, 4vw), 120px)' 
                : immersiveMode === 'minimal' 
                ? 'clamp(12px, min(6vmin, 4vw), 100px)' 
                : 'clamp(12px, min(5vmin, 3.8vw), 80px)'),
        }}
      >
        {isThreeDigit && (
          <>
            <FlipDigit value={hours} label="SAAT" isThreeDigit={true} immersiveMode={immersiveMode} />
            {/* Colon separator */}
            <div 
              className="flex flex-col justify-center py-4 transition-all duration-700 ease-in-out"
              style={{ gap: dotGap }}
            >
              <div 
                className="rounded-full bg-zinc-800 animate-pulse border border-zinc-700/50 transition-all duration-700 ease-in-out"
                style={{ width: dotSize, height: dotSize }}
              />
              <div 
                className="rounded-full bg-zinc-800 animate-pulse border border-zinc-700/50 transition-all duration-700 ease-in-out"
                style={{ width: dotSize, height: dotSize }}
              />
            </div>
          </>
        )}
        <FlipDigit value={minutes} label="DAKİKA" isThreeDigit={isThreeDigit} immersiveMode={immersiveMode} />
        {/* Colon separator */}
        <div 
          className="flex flex-col justify-center py-4 transition-all duration-700 ease-in-out"
          style={{ gap: dotGap }}
        >
          <div 
            className="rounded-full bg-zinc-800 animate-pulse border border-zinc-700/50 transition-all duration-700 ease-in-out"
            style={{ width: dotSize, height: dotSize }}
          />
          <div 
            className="rounded-full bg-zinc-800 animate-pulse border border-zinc-700/50 transition-all duration-700 ease-in-out"
            style={{ width: dotSize, height: dotSize }}
          />
        </div>
        <FlipDigit value={seconds} label="SANİYE" isThreeDigit={isThreeDigit} immersiveMode={immersiveMode} isWarningActive={isWarningActive} />
      </div>

      {/* Primary Control Buttons */}
      <div className={`flex items-center gap-4 transition-all duration-700 ease-in-out ${
        isImmersive
          ? 'opacity-0 scale-95 pointer-events-none max-h-0 overflow-hidden mt-0'
          : 'opacity-100 scale-100 max-h-20'
      }`}>
        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shadow-lg ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-500 text-zinc-950 hover:shadow-amber-500/10'
              : isDirty
              ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-emerald-500/15'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 shadow-white/5'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-zinc-950" />
              <span>DURAKLAT</span>
            </>
          ) : isDirty ? (
            <>
              <Play className="w-4 h-4 fill-zinc-950 animate-pulse" />
              <span>DEVAM ET</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>BAŞLAT</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={resetTimer}
          title="Zamanlayıcıyı Sıfırla"
          className="flex items-center justify-center p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div 
        className={`w-full max-w-[280px] flex flex-col items-center gap-1.5 transition-all duration-500 ease-in-out origin-top ${
          isActive 
            ? 'opacity-0 -translate-y-4 pointer-events-none max-h-0 mt-0 overflow-hidden' 
            : 'opacity-100 translate-y-0 max-h-24 mt-2'
        }`}
      >
        <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-500 uppercase select-none">
          HIZLI SÜRE SEÇİMİ
        </span>
        
        {/* The Carousel Wheel Container Wrapper - fixed height, absolutely no overflow to prevent any parent vertical scrollbars */}
        <div className="relative w-[280px] h-[64px] flex flex-col justify-between items-center overflow-hidden">
          {/* Inner Carousel Container */}
          <div className="w-full h-11 overflow-hidden flex items-center">
            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onMouseDown={(e) => {
                isDragging.current = true;
                setIsDraggingState(true);
                hasDragged.current = false;
                dragStartX.current = e.clientX;
                dragScrollLeft.current = scrollContainerRef.current!.scrollLeft;
              }}
              onMouseUp={() => {
                isDragging.current = false;
                setIsDraggingState(false);
                if (hasDragged.current) {
                  scrollToIndex(wheelIndex, 'smooth');
                }
              }}
              onMouseLeave={() => {
                if (isDragging.current) {
                  isDragging.current = false;
                  setIsDraggingState(false);
                  if (hasDragged.current) {
                    scrollToIndex(wheelIndex, 'smooth');
                  }
                }
              }}
              onMouseMove={(e) => {
                if (!isDragging.current) return;
                e.preventDefault();
                const x = e.clientX;
                const deltaX = Math.abs(x - dragStartX.current);
                if (deltaX > 4) {
                  hasDragged.current = true;
                }
                const walk = (x - dragStartX.current) * 1.4; // 1:1 direct tracking drag multiplier for high-precision sensitivity
                scrollContainerRef.current!.scrollLeft = dragScrollLeft.current - walk;
              }}
              onTouchStart={() => {
                isDragging.current = true;
                setIsDraggingState(true);
              }}
              onTouchEnd={() => {
                isDragging.current = false;
                setIsDraggingState(false);
              }}
              className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center scrollbar-none relative z-1 cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Left Spacer so the first item centers perfectly */}
              <div className="w-[112px] shrink-0" />
              
              {/* Presets */}
              {presets.map((preset, idx) => {
                const distance = Math.abs(idx - wheelIndex);
                
                // Get display formatting (value and unit)
                const isHour = preset >= 60;
                let displayValue = preset.toString();
                let displayUnit = "dk";
                
                if (isHour) {
                  const h = Math.floor(preset / 60);
                  const m = preset % 60;
                  if (m === 0) {
                    displayValue = `${h}`;
                    displayUnit = "sa";
                  } else {
                    displayValue = `${h}s ${m}`;
                    displayUnit = "dk";
                  }
                }

                // Proportional styling based on relative distance to active item
                let textClasses = "";
                let unitClasses = "";
                
                if (distance === 0) {
                  textClasses = isHour
                    ? "text-emerald-400 font-bold text-sm drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]"
                    : "text-emerald-400 font-bold text-xl sm:text-2xl scale-125 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]";
                  unitClasses = "text-emerald-500/80 text-[10px] font-bold";
                } else if (distance === 1) {
                  textClasses = isHour
                    ? "text-amber-500 font-semibold text-xs opacity-90 animate-pulse"
                    : "text-amber-500 font-semibold text-sm sm:text-base scale-100 opacity-90";
                  unitClasses = "text-amber-600/60 text-[8px]";
                } else if (distance === 2) {
                  textClasses = isHour
                    ? "text-rose-500 font-medium text-[10px] opacity-70"
                    : "text-rose-500 font-medium text-xs sm:text-sm scale-75 opacity-70";
                  unitClasses = "text-rose-600/40 text-[7px]";
                } else {
                  textClasses = "text-zinc-800 scale-50 opacity-0 pointer-events-none";
                  unitClasses = "opacity-0 pointer-events-none";
                }

                return (
                  <div
                    key={idx}
                    data-preset-index={idx}
                    onClick={() => scrollToIndex(idx)}
                    className="w-14 shrink-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none"
                  >
                    <span className={`font-display tracking-tighter transition-all duration-300 ${textClasses}`}>
                      {displayValue}
                    </span>
                    <span className={`font-mono uppercase tracking-widest mt-0.5 transition-all duration-300 ${unitClasses}`}>
                      {displayUnit}
                    </span>
                  </div>
                );
              })}

              {/* Right Spacer so the last item centers perfectly */}
              <div className="w-[112px] shrink-0" />
            </div>
          </div>

          {/* Center alignment guide green triangle pointing up below the active item */}
          {/* Stacked neatly at the bottom edge within the parent's fixed bounding box */}
          <div className="relative w-14 h-4 pointer-events-none z-20 flex items-start justify-center">
            <svg width="10" height="7" viewBox="0 0 10 7" className="fill-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.75)]">
              <path d="M5 0L10 7H0L5 0Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
