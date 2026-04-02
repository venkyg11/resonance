import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Music, ListMusic, Heart, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const LibraryPage = () => {
  const {
    tracks, currentTrackIndex, selectTrack, playlists, createPlaylist,
    activePlaylistId, selectPlaylist, addToPlaylist,
  } = useMusicPlayer();
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newName, setNewName] = useState('');
  const [view, setView] = useState<'all' | 'liked' | 'playlist'>('all');

  const likedTracks = tracks.filter(t => t.liked);
  const playlistTracks = activePlaylistId
    ? tracks.filter(t => playlists.find(p => p.id === activePlaylistId)?.trackIds.includes(t.id))
    : [];

  const displayTracks = view === 'liked' ? likedTracks : view === 'playlist' ? playlistTracks : tracks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 relative z-10">
      <h2 className="text-lg font-semibold text-foreground mb-3">Library</h2>

      {/* Quick filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => { setView('all'); selectPlaylist(null); }}
          className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${view === 'all' ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <ListMusic className="w-3 h-3" /> All ({tracks.length})
        </button>
        <button
          onClick={() => setView('liked')}
          className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${view === 'liked' ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <Heart className="w-3 h-3" /> Liked ({likedTracks.length})
        </button>
        {playlists.map(p => (
          <button
            key={p.id}
            onClick={() => { setView('playlist'); selectPlaylist(p.id); }}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${view === 'playlist' && activePlaylistId === p.id ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const tid = e.dataTransfer.getData('trackId'); if (tid) addToPlaylist(p.id, tid); }}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewPlaylist(true)}
          className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {showNewPlaylist && (
        <form
          onSubmit={e => { e.preventDefault(); if (newName.trim()) { createPlaylist(newName.trim()); setNewName(''); setShowNewPlaylist(false); } }}
          className="flex gap-2 mb-3"
        >
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Playlist name"
            autoFocus
            className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {displayTracks.length} tracks</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formatTime(displayTracks.reduce((a, t) => a + t.duration, 0))}
        </span>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {displayTracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {view === 'liked' ? 'No liked songs yet' : 'No tracks'}
          </div>
        )}
        {displayTracks.map((track) => {
          const realIndex = tracks.indexOf(track);
          const isActive = realIndex === currentTrackIndex;
          return (
            <button
              key={track.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('trackId', track.id)}
              onClick={() => selectTrack(realIndex)}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                isActive ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <div className="w-11 h-11 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {track.artwork ? (
                  <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              {track.liked && <Heart className="w-3 h-3 fill-primary text-primary flex-shrink-0" />}
              <span className="text-xs font-mono text-muted-foreground">{formatTime(track.duration)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryPage;
