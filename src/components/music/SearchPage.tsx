import { useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Search, Music } from 'lucide-react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SearchPage = () => {
  const { tracks, currentTrackIndex, selectTrack } = useMusicPlayer();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? tracks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.album.toLowerCase().includes(query.toLowerCase())
      )
    : tracks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 relative z-10">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-secondary text-foreground text-sm pl-10 pr-4 py-3 rounded-xl border border-border outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {query ? 'No results found' : 'Add music to search'}
          </div>
        )}
        {filtered.map((track) => {
          const realIndex = tracks.indexOf(track);
          const isActive = realIndex === currentTrackIndex;
          return (
            <button
              key={track.id}
              onClick={() => selectTrack(realIndex)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {track.artwork ? (
                  <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist} · {track.album}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{formatTime(track.duration)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchPage;
