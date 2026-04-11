import { useEffect } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Repeat1, Volume2, VolumeX, Volume1,
  Music, Video, Tv, Zap
} from 'lucide-react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ControlBarProps {
  activeMode?: 'music' | 'video';
}

const ControlBar = ({ activeMode = 'music' }: ControlBarProps) => {
  const musicPlayer = useMusicPlayer();
  const videoPlayer = useVideoPlayer();

  // Pick state based on mode
  const {
    isPlaying, togglePlay, next, previous, currentTime, duration, seekTo,
    volume, setVolume, isMuted, toggleMute, shuffle, toggleShuffle,
    repeat, cycleRepeat, tracks, currentTrackIndex
  } = activeMode === 'music' ? musicPlayer : {
    isPlaying: videoPlayer.isPlaying,
    togglePlay: videoPlayer.togglePlay,
    next: videoPlayer.next,
    previous: videoPlayer.previous,
    currentTime: videoPlayer.currentTime,
    duration: videoPlayer.duration,
    seekTo: videoPlayer.seekTo,
    volume: videoPlayer.volume,
    setVolume: videoPlayer.setVolume,
    isMuted: videoPlayer.isMuted,
    toggleMute: videoPlayer.toggleMute,
    shuffle: false,
    toggleShuffle: () => {},
    repeat: videoPlayer.isLooping ? 'one' : 'off',
    cycleRepeat: videoPlayer.toggleLoop,
    tracks: videoPlayer.videos as any, // Cast for compatibility
    currentTrackIndex: videoPlayer.currentVideoIndex
  };

  const videoSpeed = videoPlayer.playbackSpeed;
  const togglePiP = videoPlayer.togglePiP;
  const track = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const resetVolBoost = () => setVolume(1);

  // Global Keyboard Navigation (context-aware via activeMode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekTo(Math.min(currentTime + 10, duration));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekTo(Math.max(currentTime - 10, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, togglePlay, seekTo, currentTime, duration]);

  return (
    <div className="glass-3d rounded-2xl relative px-4 py-2 z-10 flex items-center justify-between gap-4 h-16">
      {/* Left: Mini thumbnail + info */}
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-md">
          {activeMode === 'video' && track?.thumbnail ? (
            <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : track?.artwork ? (
            <img src={track.artwork} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              {activeMode === 'music' ? <Music className="w-5 h-5 text-muted-foreground" /> : <Video className="w-5 h-5 text-muted-foreground" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {track?.title || (activeMode === 'video' ? 'No video selected' : 'No track selected')}
          </p>
          <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 opacity-80">
            {track?.artist || (activeMode === 'video' ? (track?.resolution || 'Video Player') : 'Music Player')}
          </p>
        </div>
      </div>

      {/* Center: Slim progress bar + Playback controls */}
      <div className="flex-1 flex flex-col items-center max-w-xl">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={previous} className="p-1.5 text-foreground hover:text-primary transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="gradient-primary w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform shadow-md"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={next} className="p-1.5 text-foreground hover:text-primary transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 relative h-1 group hover:h-1.5 transition-all flex items-center">
            <div className="absolute inset-0 bg-muted rounded-full pointer-events-none" />
            <div className="h-full rounded-full gradient-primary transition-all pointer-events-none" style={{ width: `${progress}%` }} />
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
          <span className="text-[10px] font-mono text-muted-foreground w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Mode-specific controls */}
      <div className="w-1/4 flex items-center justify-end gap-1 sm:gap-2">
        {activeMode === 'music' ? (
          <>
            <button onClick={toggleShuffle} className={`p-2 rounded-lg transition-all ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={cycleRepeat} className={`p-2 rounded-lg transition-all ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={resetVolBoost}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                volume > 1 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              {Math.round(volume * 100)}%
            </button>
            <button onClick={togglePiP} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Picture in Picture">
              <Tv className="w-4 h-4" />
            </button>
            <button 
              className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-bold hover:text-foreground transition-all flex items-center gap-1"
              title="Playback Speed"
            >
              <Zap className="w-3 h-3" />
              {videoSpeed.toFixed(1)}x
            </button>
          </>
        )}
        
        <div className="h-4 w-[1px] bg-border mx-1" />
        
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
