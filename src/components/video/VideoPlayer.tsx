import { useRef, useState, useEffect } from 'react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { 
  Play, Pause, SkipBack, SkipForward, FastForward, Rewind, 
  Volume2, VolumeX, Maximize, Minimize, Tv, Repeat, 
  Settings, Camera, Scissors, Type, Layout, Sun, Contrast as ContrastIcon,
  AlertTriangle, Gauge, Zap, Plus, X, List, MoreHorizontal
} from 'lucide-react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const VideoPlayer = () => {
  const {
    videos, currentVideoIndex, isPlaying, currentTime, duration,
    volume, isMuted, playbackSpeed, brightness, contrast,
    aspectRatio, isLooping, showPiP,
    play, pause, togglePlay, next, previous, seekTo, setVolume,
    toggleMute, setPlaybackSpeed, setBrightness, setContrast,
    setAspectRatio, toggleLoop, togglePiP, takeScreenshot,
    // @ts-ignore
    setVideoRef, setCurrentTime, setDuration, setIsPlaying
  } = useVideoPlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  const track = currentVideoIndex >= 0 ? videos[currentVideoIndex] : null;

  // Link UI video element to Context
  useEffect(() => {
    if (videoRef.current) {
      setVideoRef(videoRef.current);
    }
    return () => setVideoRef(null);
  }, [setVideoRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle auto-load when track changes
  useEffect(() => {
    if (track && videoRef.current) {
      // Ensure the video element is reloaded with the new source
      videoRef.current.load();
      // If global state is already 'playing', try to start immediately
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Autoplay prevented or playback error:", error);
            // Sometimes browsers need a second attempt or user to click the video area
          });
        }
      }
    }
  }, [track?.id]);

  // Handle global isPlaying state toggles
  useEffect(() => {
    if (videoRef.current && track) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleInteraction = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
    }
  };

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border min-h-[300px] md:min-h-[400px] m-2">
        <Tv className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-20" />
        <p className="text-base md:text-lg font-medium text-center px-4">No video selected</p>
        <p className="text-xs md:text-sm opacity-60 text-center px-4 mt-1">Scan your library or add a video file to begin</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative group flex flex-col w-full h-full mx-auto md:rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 ${isFullscreen ? 'rounded-none' : ''}`}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Video Display Area */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden group">
        <video
          ref={videoRef}
          id="aura-main-video"
          src={track.objectUrl}
          playsInline
          className="w-full h-full object-contain transition-all duration-300 pointer-events-auto will-change-transform optimized-gpu"
          style={{
            // Hardware acceleration hints within style as fallback
            transform: 'translate3d(0,0,0)',
            filter: autoEnhance 
              ? 'contrast(1.15) brightness(1.07) saturate(1.18)' 
              : ((brightness === 100 && contrast === 100) ? 'none' : `brightness(${brightness}%) contrast(${contrast}%)`),
            aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => !isLooping && next()}
          onClick={togglePlay}
          onDoubleClick={(e) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX - rect.left > rect.width / 2) seekTo(Math.min(currentTime + 10, duration));
            else seekTo(Math.max(currentTime - 10, 0));
          }}
          onTouchEnd={(e) => {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.changedTouches[0];
              if (touch.clientX - rect.left > rect.width / 2) seekTo(Math.min(currentTime + 10, duration));
              else seekTo(Math.max(currentTime - 10, 0));
              lastTapRef.current = 0;
            } else {
              lastTapRef.current = now;
            }
          }}
        />

        {/* Global Control Overlays */}
        {!showControls && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Persistent Controls Overlay (bottom) */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-500 z-20 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        <div className="flex flex-col gap-3 md:gap-4 max-w-5xl mx-auto">
          
          {/* Custom Seek Bar */}
          <div className="flex items-center gap-3 md:gap-4 group/seek">
            <span className="text-[10px] md:text-[11px] font-mono text-white/70 w-8 md:w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1.5 group-hover/seek:h-2.5 transition-all flex items-center">
              <div className="absolute inset-0 bg-white/20 rounded-full pointer-events-none" />
              <div className="absolute inset-0 h-full gradient-primary rounded-full transition-all pointer-events-none shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
              {/* Handle */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/seek:scale-100 transition-transform pointer-events-none"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              />
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
                style={{ padding: 0 }}
              />
            </div>
            <span className="text-[10px] md:text-[11px] font-mono text-white/70 w-8 md:w-12 tabular-nums">{formatTime(duration)}</span>
          </div>

          {/* Status and Primary Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Title - Visible on Desktop, hidden on Mobile if clean view active */}
            <div className="hidden md:flex flex-col min-w-0">
              <h3 className="text-white font-bold text-base truncate max-w-md">{track.title}</h3>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                  {track.resolution || 'Auto'}
                </span>
                <span className="text-[10px] text-white/40 font-medium">1080p Stream Optimized</span>
              </div>
            </div>

            {/* Main Playback Controls - Always Visible */}
            <div className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 md:gap-6">
              <button onClick={previous} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95">
                <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-primary flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
              >
                {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7" /> : <Play className="w-6 h-6 md:w-7 md:h-7 ml-1" />}
              </button>

              <button onClick={next} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95">
                <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Right side utility icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button 
                onClick={toggleMute} 
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Mute/Unmute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
              </button>

              {/* Mobile Plus Button - Only on Mobile */}
              <button 
                onClick={() => setShowMore(!showMore)}
                className={`md:hidden p-2.5 rounded-full transition-all ${showMore ? 'bg-primary text-white rotate-45' : 'bg-white/10 text-white'}`}
              >
                <Plus className="w-5 h-5" />
              </button>

              <button 
                onClick={toggleFullscreen} 
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </div>
          </div>

          {/* Expanded Secondary Controls - Mobile Overlay or Desktop Bottom Row */}
          <div className={`
            grid transition-all duration-300 ease-in-out
            ${showMore ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 md:grid-rows-[1fr] md:opacity-100 md:mt-2'}
          `}>
            <div className="overflow-hidden">
              <div className="w-full max-w-sm pt-4 border-t border-white/10 mb-4">
                {/* Auto Enhance Toggle */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-4 py-2 border border-white/5">
                    <div className="flex items-center gap-3">
                      <ContrastIcon className={`w-4 h-4 transition-colors ${autoEnhance ? 'text-cyan-400' : 'text-white/60'}`} />
                      <span className="text-white/90 font-medium text-sm">Enhance (OPT)</span>
                    </div>
                    <button 
                      onClick={() => setAutoEnhance(!autoEnhance)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoEnhance ? 'bg-cyan-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${autoEnhance ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  
                  {/* Status Strip */}
                  <div className={`overflow-hidden transition-all duration-300 ${autoEnhance ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-1.5 w-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                      <span className="text-cyan-200 text-[10px] font-medium tracking-wide truncate flex-1">
                        Clarity enhancement active — picture quality improved automatically
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                        +HD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Options Group */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                  <OptionItem icon={<Tv className="w-4 h-4" />} label="PiP" active={showPiP} onClick={togglePiP} />
                  <OptionItem icon={<Repeat className="w-4 h-4" />} label="Loop" active={isLooping} onClick={toggleLoop} />
                  <OptionItem 
                    icon={<Zap className="w-4 h-4" />} 
                    label={`${playbackSpeed}x`} 
                    onClick={() => setPlaybackSpeed(playbackSpeed >= 2 ? 0.5 : playbackSpeed + 0.5)} 
                  />
                  <OptionItem icon={<Layout className="w-4 h-4" />} label={aspectRatio} onClick={() => setAspectRatio(aspectRatio === '16/9' ? '4/3' : '16/9')} />
                </div>

                {/* Extra Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={takeScreenshot} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 flex items-center gap-2 border border-white/5 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:inline">Capture</span>
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 flex items-center gap-2 border border-white/5 transition-colors">
                    <Scissors className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:inline">Trim</span>
                  </button>
                </div>

                {/* Volume Slider for Desktop/Expanded */}
                <div className="hidden sm:flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Volume2 className="w-4 h-4 text-white/40" />
                  <input 
                    type="range" min="0" max="1.5" step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="aura-vol-slider w-20 lg:w-32"
                  />
                  <span className="text-[10px] font-mono text-white/40 w-8">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Mobile Title Info - Only visible in expanded mobile view */}
              <div className="md:hidden mt-4 pb-2 border-t border-white/5 pt-4">
                 <h3 className="text-white font-bold text-sm truncate">{track.title}</h3>
                 <p className="text-[10px] text-white/40 mt-1 uppercase tracking-tight">
                    {track.resolution || 'Auto'} • {formatTime(duration)} • {track.size ? (track.size / (1024 * 1024)).toFixed(1) : '0'} MB
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OptionItem = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all p-2 rounded-xl min-w-[64px] hover:bg-white/5 ${active ? 'text-primary' : 'text-white/60 hover:text-white'}`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-primary/20 scale-110' : 'bg-white/5'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{label}</span>
  </button>
);

export default VideoPlayer;
