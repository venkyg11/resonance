import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Music, ListMusic, Plus } from 'lucide-react';
import { useState } from 'react';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const TrackSidebar = ({ hidePlaylists = false, title = "Queue" }: { hidePlaylists?: boolean, title?: string }) => {
  const {
    tracks, currentTrackIndex, selectTrack, playlists, createPlaylist,
    activePlaylistId, selectPlaylist, addToPlaylist,
  } = useMusicPlayer();
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newName, setNewName] = useState('');

  const displayTracks = activePlaylistId
    ? tracks.filter(t => playlists.find(p => p.id === activePlaylistId)?.trackIds.includes(t.id))
    : tracks;

  const handleDrop = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    const trackId = e.dataTransfer.getData('trackId');
    if (trackId) addToPlaylist(playlistId, trackId);
  };

  return (
    <aside className="glass-subtle flex flex-col h-full w-full overflow-hidden">
      {/* Playlists */}
      {!hidePlaylists && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Playlists</span>
            <button onClick={() => setShowNewPlaylist(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewPlaylist && (
            <form
              onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { createPlaylist(newName.trim()); setNewName(''); setShowNewPlaylist(false); } }}
              className="flex gap-1 mb-2"
            >
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Playlist name"
                autoFocus
                className="flex-1 bg-muted text-foreground text-xs px-2 py-1 rounded border-none outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
          )}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => selectPlaylist(null)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${!activePlaylistId ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={() => selectPlaylist(p.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, p.id)}
                className={`text-xs px-2 py-1 rounded-full transition-all ${activePlaylistId === p.id ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Track list */}
      <div className={`px-2 pb-2 ${hidePlaylists ? 'pt-4' : 'pt-2'}`}>
        <div className="flex items-center gap-2 px-2 mb-1">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title} · {displayTracks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {displayTracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Drop audio files here to start
          </div>
        )}
        {displayTracks.map((track, i) => {
          const realIndex = tracks.indexOf(track);
          const isActive = realIndex === currentTrackIndex;
          return (
            <button
              key={track.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('trackId', track.id)}
              onClick={() => selectTrack(realIndex)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all group ${
                isActive ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-secondary/50 border-l-2 border-transparent'
              }`}
            >
              <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
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
              <span className="text-xs font-mono text-muted-foreground">{formatTime(track.duration)}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default TrackSidebar;
