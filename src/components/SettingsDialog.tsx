import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, CloudRain, ShieldAlert, SlidersHorizontal, Maximize, Minimize, Newspaper, Pin } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isTickingEnabled: boolean;
  setIsTickingEnabled: (val: boolean) => void;
  ambientSound: 'none' | 'white' | 'rain';
  setAmbientSound: (val: 'none' | 'white' | 'rain') => void;
  isNewsDisabled: boolean;
  setIsNewsDisabled: (val: boolean) => void;
  keepFooterVisible: boolean;
  setKeepFooterVisible: (val: boolean) => void;
  inactivityBehavior: 'full' | 'minimal';
  setInactivityBehavior: (val: 'full' | 'minimal') => void;
  countdownWarning: 'off' | '5' | '10';
  setCountdownWarning: (val: 'off' | '5' | '10') => void;
  alarmSound: 'classic' | 'cool';
  setAlarmSound: (val: 'classic' | 'cool') => void;
  warningBeep: boolean;
  setWarningBeep: (val: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  isTickingEnabled,
  setIsTickingEnabled,
  ambientSound,
  setAmbientSound,
  isNewsDisabled,
  setIsNewsDisabled,
  keepFooterVisible,
  setKeepFooterVisible,
  inactivityBehavior,
  setInactivityBehavior,
  countdownWarning,
  setCountdownWarning,
  alarmSound,
  setAlarmSound,
  warningBeep,
  setWarningBeep,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial check
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn("Fullscreen API is not fully supported or allowed here:", e);
    }
  };

  // Ensure AudioContext is initialized/resumed on interaction
  const handleInteraction = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const tempCtx = new AudioContextClass();
        tempCtx.resume();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            id="settings-backdrop"
          />

          {/* Modal Card content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl rounded-2xl p-6 overflow-hidden paper-texture-card select-none z-10"
            id="settings-modal"
          >
            {/* Top Amber Accented bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <h2 className="font-display text-base font-extrabold text-zinc-100 tracking-tight uppercase">
                  KADRAN AYARLARI
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition-colors cursor-pointer"
                title="Kapat"
                id="close-settings-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              {/* Saniye Tik Sesi Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                      Saniye Tik Sesi
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Zamanlayıcı çalışırken retro tik-tak sesi çalar.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleInteraction();
                      setIsTickingEnabled(!isTickingEnabled);
                    }}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isTickingEnabled
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                        : 'bg-zinc-950/40 text-zinc-600 border-zinc-800/80 hover:text-zinc-400'
                    }`}
                    id="toggle-ticking-btn"
                  >
                    {isTickingEnabled ? <Volume2 className="w-5 h-5 animate-[pulse_1.5s_infinite]" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Ambient Sounds Section */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                    Arka Plan Odaklanma Sesi
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mb-1.5">
                    Odaklanmayı artırmak için sentetik gürültü frekansları.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      handleInteraction();
                      setAmbientSound('none');
                    }}
                    className={`p-3 rounded-xl border font-mono text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      ambientSound === 'none'
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-inner'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="ambient-none-btn"
                  >
                    KAPALI
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setAmbientSound('white');
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-mono text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      ambientSound === 'white'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="ambient-white-btn"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500/80" />
                    <span>GÜRÜLTÜ</span>
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setAmbientSound('rain');
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-mono text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      ambientSound === 'rain'
                        ? 'bg-blue-950/40 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="ambient-rain-btn"
                  >
                    <CloudRain className="w-3.5 h-3.5 text-blue-400/80" />
                    <span>YAĞMUR</span>
                  </button>
                </div>
              </div>

              {/* Haber Akışı Bölümü */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                      Haber Akışı
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Alt kısımda güncel haber başlıklarını kaydırır.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleInteraction();
                      setIsNewsDisabled(!isNewsDisabled);
                    }}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      !isNewsDisabled
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                        : 'bg-zinc-950/40 text-zinc-600 border-zinc-800/80 hover:text-zinc-400'
                    }`}
                    id="toggle-news-btn"
                  >
                    <Newspaper className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Kapanmasını Engelle Switch (Only show if news is active) */}
                <AnimatePresence>
                  {!isNewsDisabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between pl-3 border-l-2 border-zinc-800/80">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                            Alt Paneli Sabitle
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Zamanlayıcı çalışırken haber akışının kapanmasını önler.
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            handleInteraction();
                            setKeepFooterVisible(!keepFooterVisible);
                          }}
                          className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                            keepFooterVisible
                              ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                              : 'bg-zinc-950/40 text-zinc-600 border-zinc-800/80 hover:text-zinc-400'
                          }`}
                          id="toggle-keep-footer-btn"
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Inactivity Mode Section */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                    Oto-Odak Modu (10sn Hareketsizlik)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mb-2">
                    Zamanlayıcı çalışırken imleç hareket etmezse ne olacağını belirleyin.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleInteraction();
                      setInactivityBehavior('full');
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center font-mono transition-all duration-200 cursor-pointer ${
                      inactivityBehavior === 'full'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="inactivity-full-btn"
                  >
                    <span className="text-[10px] font-bold uppercase">Kapat ve Büyüt</span>
                    <span className="text-[8px] opacity-75 leading-tight font-sans">Tam Ekran (Tümünü Gizle)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setInactivityBehavior('minimal');
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center font-mono transition-all duration-200 cursor-pointer ${
                      inactivityBehavior === 'minimal'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="inactivity-minimal-btn"
                  >
                    <span className="text-[10px] font-bold uppercase">Korumalı Büyüt</span>
                    <span className="text-[8px] opacity-75 leading-tight font-sans">Sadece Butonları Gizle</span>
                  </button>
                </div>
              </div>

              {/* Countdown Warning Section */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                    Son Saniyeler Uyarısı
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mb-1.5">
                    Süre bitimine az kala saniye hanesini neon kırmızı yapar.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      handleInteraction();
                      setCountdownWarning('off');
                    }}
                    className={`p-2.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      countdownWarning === 'off'
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-inner'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="warning-off-btn"
                  >
                    KAPALI
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setCountdownWarning('5');
                    }}
                    className={`p-2.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      countdownWarning === '5'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="warning-5-btn"
                  >
                    5 SANİYE
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setCountdownWarning('10');
                    }}
                    className={`p-2.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      countdownWarning === '10'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="warning-10-btn"
                  >
                    10 SANİYE
                  </button>
                </div>
              </div>

              {/* Countdown Warning Beep Section */}
              <div className="flex flex-col gap-2 border-t border-zinc-800/50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                      Son Saniyeler Sesli Sinyal
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Son saniyeler uyarısı boyunca her saniye "dın" uyarı sesi çalar.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleInteraction();
                      setWarningBeep(!warningBeep);
                    }}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      warningBeep
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                        : 'bg-zinc-950/40 text-zinc-600 border-zinc-800/80 hover:text-zinc-400'
                    }`}
                    id="toggle-warning-beep-btn"
                    title={warningBeep ? "Sinyal Sesini Kapat" : "Sinyal Sesini Aç"}
                  >
                    {warningBeep ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Completion Sound Section */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                    Zamanlayıcı Alarm Sesi
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mb-1.5">
                    Süre dolduğunda çalacak uyarı sesini seçin.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleInteraction();
                      setAlarmSound('classic');
                    }}
                    className={`p-2.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      alarmSound === 'classic'
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-inner'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="alarm-classic-btn"
                  >
                    KLASİK ZİL
                  </button>

                  <button
                    onClick={() => {
                      handleInteraction();
                      setAlarmSound('cool');
                    }}
                    className={`p-2.5 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      alarmSound === 'cool'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/30 text-zinc-500 border-zinc-800/60 hover:text-zinc-300'
                    }`}
                    id="alarm-cool-btn"
                  >
                    MODERN UYARI
                  </button>
                </div>
              </div>

              {/* Fullscreen Mode Section */}
              <div className="flex flex-col gap-2 border-t border-zinc-800/50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                      Tam Ekran Modu
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Odaklanma konforu için uygulamayı tam ekran yapın.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleInteraction();
                      toggleFullscreen();
                    }}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isFullscreen
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                    id="toggle-fullscreen-btn"
                    title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5 animate-pulse" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Informative Note Box */}
              <div className="flex gap-2.5 p-3.5 bg-zinc-950/40 border border-zinc-800/50 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono leading-relaxed text-zinc-500">
                  <span className="font-bold text-zinc-400 uppercase block mb-0.5">NOT</span>
                  Seslerin çalabilmesi için zamanlayıcının aktif olarak geriye doğru sayıyor olması gerekir. Tarayıcı ses güvenlik kısıtlamaları nedeniyle ilk ses tıkından önce arayüze tıklamış olmanız önemlidir.
                </p>
              </div>
            </div>

            {/* Footer action */}
            <div className="flex justify-end mt-6 border-t border-zinc-800/80 pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase"
                id="save-settings-btn"
              >
                TAMAM
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
