import { useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Music, Heart, ChevronDown, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Volume1, Sliders } from 'lucide-react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MiniPlayerProps {
  activeMode?: 'music' | 'video';
}

const MiniPlayer = ({ activeMode = 'music' }: MiniPlayerProps) => {
  const musicPlayer = useMusicPlayer();
  const videoPlayer = useVideoPlayer();

  const {
    tracks, currentTrackIndex, isPlaying, togglePlay, next, previous,
    currentTime, duration, seekTo, volume, setVolume, isMuted, toggleMute,
    shuffle, toggleShuffle, repeat, cycleRepeat, toggleLike, toggleEqualizer,
  } = activeMode === 'music' ? musicPlayer : {
    tracks: videoPlayer.videos as any,
    currentTrackIndex: videoPlayer.currentVideoIndex,
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
    toggleLike: (id: string) => videoPlayer.removeVideo(videoPlayer.videos.findIndex(v => v.id === id)), // Temporary mapping or placeholder
    toggleEqualizer: () => {}
  };
  const [expanded, setExpanded] = useState(false);
  const track = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) return null;

  // Expanded full-screen player
  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setExpanded(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="w-6 h-6" />
          </button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Now Playing</span>
          <button onClick={toggleEqualizer} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="relative w-64 h-64 mb-8">
            <div className={`absolute inset-0 rounded-2xl ${isPlaying ? 'glow-accent' : ''} transition-shadow duration-700`} />
            <div className="w-full h-full rounded-2xl bg-muted overflow-hidden relative">
              {activeMode === 'video' && track.thumbnail ? (
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
              ) : track.artwork ? (
                <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Music className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center w-full max-w-xs mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 text-left">
                <h2 className="text-lg font-semibold text-foreground truncate">{track.title}</h2>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist || (activeMode === 'video' ? track.resolution : '')}
                </p>
              </div>
              <button onClick={() => toggleLike(track.id)} className="ml-3 transition-all hover:scale-110">
                <Heart className={`w-5 h-5 ${track.liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
          </div>

          {/* Seek Bar */}
          <div className="w-full max-w-xs mb-4">
            <div
              className="w-full h-1.5 bg-muted rounded-full cursor-pointer group hover:h-2.5 transition-all relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs font-mono text-muted-foreground">{formatTime(currentTime)}</span>
              <span className="text-xs font-mono text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-6 mb-6">
            <button onClick={toggleShuffle} className={`p-2 ${shuffle ? 'text-primary' : 'text-muted-foreground'}`}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={previous} className="p-2 text-foreground">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <button onClick={next} className="p-2 text-foreground">
              <SkipForward className="w-6 h-6" />
            </button>
            <button onClick={cycleRepeat} className={`p-2 ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'}`}>
              {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs opacity-80 mt-2">
            <button onClick={toggleMute} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> :
               volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block flex-1 relative">
              <input
                type="range" min="0" max="1.5" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 cursor-pointer appearance-none rounded-full"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(var(--primary)) 0%, 
                    hsl(var(--primary)) ${Math.min(volume, 1) * 66.6}%`, 
                }}
              />
            </div>
            <span className={`hidden sm:block text-[10px] font-mono w-8 ${
              volume > 1.4 ? 'text-red-400' : volume > 1 ? 'text-orange-400' : 'text-muted-foreground'
            }`}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed mini player
  return (
    <div className="glass-3d rounded-2xl relative overflow-hidden h-[64px] flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setExpanded(true)}>
      {/* Progress strip */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-muted z-10">
        <div className="h-full gradient-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center px-3 w-full h-full relative">
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-3 min-w-0 w-[50%] sm:w-1/3 pr-2">
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-md">
            {activeMode === 'video' && track.thumbnail ? (
              <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
            ) : track.artwork ? (
              <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center -mt-1 sm:mt-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">{track.title}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 opacity-80">
              {track.artist || (activeMode === 'video' ? track.resolution : '')}
            </p>
          </div>
        </div>
        {/* Center/Right: Controls */}
        <div className="absolute left-[55%] sm:left-1/2 top-[60%] sm:top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4" onClick={e => e.stopPropagation()}>
          <button onClick={previous} className="p-2 text-foreground hover:text-primary transition-colors">
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={togglePlay} className="p-2 text-primary hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7" />}
          </button>
          <button onClick={next} className="p-2 text-foreground hover:text-primary transition-colors">
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
