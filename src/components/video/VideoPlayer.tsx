import { useRef, useState, useEffect } from 'react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { 
  Play, Pause, SkipBack, SkipForward, FastForward, Rewind, 
  Volume2, VolumeX, Maximize, Minimize, Tv, Repeat, 
  Settings, Camera, Scissors, Type, Layout, Sun, Contrast as ContrastIcon,
  AlertTriangle, Gauge, Zap
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

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
            filter: (brightness === 100 && contrast === 100) ? 'none' : `brightness(${brightness}%) contrast(${contrast}%)`,
            aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => !isLooping && next()}
          onClick={togglePlay}
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
      <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="flex flex-col gap-3 md:gap-4">
          
          {/* Custom Seek Bar */}
          <div className="flex items-center gap-3 md:gap-4 group/seek">
            <span className="text-[10px] md:text-[11px] font-mono text-white/50 w-8 md:w-12 text-right">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full cursor-pointer relative group-hover/seek:h-2 transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seekTo(pct * duration);
              }}
            >
              <div className="absolute inset-0 h-full bg-white/20 transition-all" style={{ width: '0%' }} />
              <div className="absolute inset-0 h-full gradient-primary transition-all duration-100" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
            </div>
            <span className="text-[10px] md:text-[11px] font-mono text-white/50 w-8 md:w-12">{formatTime(duration)}</span>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{track.title}</h3>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider block w-fit">
                  {track.resolution || 'Auto'}
                </span>
                <span className="text-[10px] text-white/40 font-medium">1080p Stream Optimized</span>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={previous} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button onClick={() => seekTo(currentTime - 10)} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <Rewind className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full gradient-primary flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />}
              </button>

              <button onClick={() => seekTo(currentTime + 10)} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <FastForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button onClick={next} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Volume Boost for Mobile: Show as icon/badge, toggle slider on tap if space limited */}
            <div className="hidden sm:flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${volume > 1.7 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/60'}`}>
                  {Math.round(volume * 100)}%
                </div>
              </div>
              <input 
                type="range" min="0" max="2" step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="aura-vol-slider w-24 md:w-32 lg:w-40"
              />
            </div>

            <div className="flex items-center gap-1 md:gap-3">
              <button onClick={toggleMute} className="p-1.5 md:p-2 text-white/70 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <button onClick={toggleFullscreen} className="p-1.5 md:p-2 text-white/70 hover:text-white transition-colors">
                {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop-only options or hidden on small mobile */}
          <div className="hidden md:flex items-center justify-between gap-4 pt-2 border-t border-white/10 mt-1">
            <div className="flex items-center gap-4">
              <OptionItem icon={<Tv className="w-4 h-4" />} label="PiP" active={showPiP} onClick={togglePiP} />
              <OptionItem icon={<Repeat className="w-4 h-4" />} label="Loop" active={isLooping} onClick={toggleLoop} />
              <OptionItem 
                icon={<Zap className="w-4 h-4" />} 
                label={`${playbackSpeed}x`} 
                onClick={() => setPlaybackSpeed(playbackSpeed >= 2 ? 0.5 : playbackSpeed + 0.5)} 
              />
              <OptionItem icon={<Layout className="w-4 h-4" />} label={aspectRatio} onClick={() => setAspectRatio(aspectRatio === '16/9' ? '4/3' : '16/9')} />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={takeScreenshot} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Capture</span>
              </button>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Trim</span>
              </button>
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
