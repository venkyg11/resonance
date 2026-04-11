import { useRef } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Heart, Music, Sliders } from 'lucide-react';

const NowPlaying = () => {
  const { tracks, currentTrackIndex, isPlaying, toggleLike, toggleEqualizer, currentTime, duration, seekTo } = useMusicPlayer();
  const track = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;
  const lastTapRef = useRef<number>(0);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 relative z-10 animate-fade-in">
      {/* Album art */}
      <div className="relative w-[220px] h-[220px] md:w-72 md:h-72 mb-6 group mx-auto">
        {track?.artwork && (
          <img src={track.artwork} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-105 pointer-events-none transition-all duration-700" alt="" />
        )}
        <div className={`absolute inset-0 rounded-2xl ${isPlaying && !track?.artwork ? 'glow-accent' : ''} transition-shadow duration-700`} />
        <div 
          className="w-full h-full rounded-2xl bg-muted overflow-hidden relative z-10 shadow-2xl cursor-pointer"
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
        >
          {track?.artwork ? (
            <img src={track.artwork} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Music className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Track info */}
      <div className="text-center max-w-xs">
        <h2 className="text-xl font-semibold text-foreground truncate">
          {track?.title || 'No track selected'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 truncate">{track?.artist || 'Add music to begin'}</p>
        {track && <p className="text-xs text-muted-foreground mt-0.5">{track.album}</p>}
      </div>

      {/* Micro-EQ Micro-Animation */}
      {track && (
        <div className="flex items-end justify-center gap-0.5 h-4 mt-8 mb-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`eq-bar ${!isPlaying ? 'paused' : ''}`}
              style={{ 
                animationDelay: `${i * 0.15}s`,
                opacity: 0.8 - (i * 0.05)
              }} 
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {track && (
        <div className="flex items-center gap-4 mt-6">
          <button onClick={() => toggleLike(track.id)} className="transition-all hover:scale-110">
            <Heart className={`w-5 h-5 ${track.liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
          </button>
          <button onClick={toggleEqualizer} className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110">
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;
