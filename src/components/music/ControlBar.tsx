import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Repeat1, Volume2, VolumeX, Volume1,
} from 'lucide-react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ControlBar = () => {
  const {
    isPlaying, togglePlay, next, previous, currentTime, duration, seekTo,
    volume, setVolume, isMuted, toggleMute, shuffle, toggleShuffle,
    repeat, cycleRepeat, tracks,
  } = useMusicPlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-3d rounded-2xl relative px-6 py-3 z-10">
      {/* Seek bar */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-mono text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
        <div
          className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer group hover:h-2.5 transition-all relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * duration);
          }}
        >
          <div
            className="h-full rounded-full gradient-primary transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={toggleShuffle} className={`p-2 rounded-lg transition-all ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={cycleRepeat} className={`p-2 rounded-lg transition-all ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={previous} className="p-2 text-foreground hover:text-primary transition-colors" disabled={tracks.length === 0}>
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="gradient-primary w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-lg"
            disabled={tracks.length === 0}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={next} className="p-2 text-foreground hover:text-primary transition-colors" disabled={tracks.length === 0}>
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> :
             volume < 0.5 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative w-24">
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) ${Math.min(volume, 1) * 50}%, 
                  ${volume > 1 ? `hsl(30 90% 50%) ${50}%, hsl(0 80% 50%) ${Math.min(volume / 2, 1) * 100}%` : `hsl(var(--muted)) ${Math.min(volume, 1) * 50}%`}, 
                  hsl(var(--muted)) 100%)`,
              }}
            />
          </div>
          <span className={`text-[10px] font-mono w-8 text-right ${
            volume > 1.5 ? 'text-red-400' : volume > 1 ? 'text-orange-400' : 'text-muted-foreground'
          }`}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
