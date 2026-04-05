import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { get, set } from '../utils/db';

export interface Track {
  id: string;
  file: File;
  title: string;
  artist: string;
  album: string;
  duration: number;
  objectUrl: string;
  artwork?: string;
  liked: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

type RepeatMode = 'off' | 'all' | 'one';

interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

interface MusicPlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  eqBands: EQBand[];
  playlists: Playlist[];
  activePlaylistId: string | null;
  analyserNode: AnalyserNode | null;
  showEqualizer: boolean;
}

interface MusicPlayerActions {
  addFiles: (files: FileList) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: (id: string) => void;
  setEQGain: (index: number, gain: number) => void;
  selectTrack: (index: number) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  selectPlaylist: (id: string | null) => void;
  removeTrack: (index: number) => void;
  toggleEqualizer: () => void;
  showToast: (msg: string) => void;
}

type ContextType = MusicPlayerState & MusicPlayerActions & { toastMessage: string | null };

const MusicPlayerContext = createContext<ContextType | null>(null);

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
};

const DEFAULT_EQ: EQBand[] = [
  { frequency: 60, gain: 0, label: 'Bass' },
  { frequency: 250, gain: 0, label: 'Low' },
  { frequency: 1000, gain: 0, label: 'Mid' },
  { frequency: 4000, gain: 0, label: 'High' },
  { frequency: 10000, gain: 0, label: 'Treble' },
];

function parseFilename(name: string): { title: string; artist: string } {
  const clean = name.replace(/\.[^/.]+$/, '');
  const parts = clean.split(' - ');
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { title: clean, artist: 'Unknown Artist' };
}

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const saved = localStorage.getItem('aura-music-index');
    return saved ? parseInt(saved, 10) : -1;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem('aura-music-time');
    return saved ? parseFloat(saved) : 0;
  });
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [eqBands, setEqBands] = useState<EQBand[]>(DEFAULT_EQ);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('music-playlists');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const connectedRef = useRef(false);
  const shuffleHistoryRef = useRef<number[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Save playlists
  useEffect(() => {
    localStorage.setItem('music-playlists', JSON.stringify(playlists));
  }, [playlists]);

  // DB Load on mount
  useEffect(() => {
    get('saved-tracks').then((saved: Track[]) => {
      if (saved && Array.isArray(saved)) {
        const restored = saved.map(t => ({
          ...t,
          objectUrl: t.file ? URL.createObjectURL(t.file) : t.objectUrl
        }));
        setTracks(restored);
        
        // Restore last played track settings after tracks are loaded
        const savedIndex = localStorage.getItem('aura-music-index');
        const savedTime = localStorage.getItem('aura-music-time');
        
        if (savedIndex !== null) {
          const idx = parseInt(savedIndex, 10);
          if (idx >= 0 && idx < restored.length) {
            // Load but don't autoplay
            const track = restored[idx];
            const audio = audioRef.current!;
            audio.src = track.objectUrl;
            if (savedTime) audio.currentTime = parseFloat(savedTime);
            audio.load();
          }
        }
      }
    }).catch(console.error)
      .finally(() => setIsDbLoaded(true));
  }, []);

  // Persist Current State
  useEffect(() => {
    if (isDbLoaded) {
      localStorage.setItem('aura-music-index', currentTrackIndex.toString());
    }
  }, [currentTrackIndex, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded && currentTrackIndex !== -1) {
      localStorage.setItem('aura-music-time', currentTime.toString());
    }
  }, [currentTime, currentTrackIndex, isDbLoaded]);

  // DB Save on change
  useEffect(() => {
    if (isDbLoaded) {
      set('saved-tracks', tracks).catch(console.error);
    }
  }, [tracks, isDbLoaded]);

  // Init audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.8;
    }
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => handleTrackEnd();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const initAudioContext = useCallback(() => {
    if (connectedRef.current) return;
    const audio = audioRef.current!;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    const gain = ctx.createGain();
    gainRef.current = gain;

    // EQ filters
    const filters = DEFAULT_EQ.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = band.frequency;
      filter.Q.value = 1.4;
      filter.gain.value = band.gain;
      return filter;
    });
    filtersRef.current = filters;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    setAnalyserNode(analyser);

    // Chain: source → gain → filters → analyser → destination
    source.connect(gain);
    let prev: AudioNode = gain;
    filters.forEach(f => { prev.connect(f); prev = f; });
    prev.connect(analyser);
    analyser.connect(ctx.destination);

    connectedRef.current = true;
  }, []);

  const handleTrackEnd = useCallback(() => {
    setIsPlaying(false);
    // Use refs to get current state
    const repeatMode = repeat;
    if (repeatMode === 'one') {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
      setIsPlaying(true);
    } else {
      // next will handle 'all' and 'off'
      nextTrack();
    }
  }, [repeat, tracks.length, shuffle, currentTrackIndex]);

  // Re-attach ended listener when deps change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => handleTrackEnd();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [handleTrackEnd]);

  const loadTrack = useCallback((index: number, autoplay = true) => {
    if (index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    const audio = audioRef.current!;
    audio.src = track.objectUrl;
    audio.load();
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    if (autoplay) {
      initAudioContext();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [tracks, initAudioContext]);

  const addFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    if (validFiles.length === 0) return;

    const newTracks: Track[] = validFiles.map(file => {
      const { title, artist } = parseFilename(file.name);
      return {
        id: crypto.randomUUID(),
        file,
        title,
        artist,
        album: 'Unknown Album',
        duration: 0,
        objectUrl: URL.createObjectURL(file),
        liked: false,
      };
    });

    setTracks(prev => {
      const updated = [...prev, ...newTracks];
      if (prev.length === 0 && newTracks.length > 0) {
        setTimeout(() => loadTrack(0, false), 50);
      }
      return updated;
    });

    showToast(`Added ${newTracks.length} track${newTracks.length > 1 ? 's' : ''}`);

    // Process metadata asynchronously in background
    newTracks.forEach(track => {
      // Resolve duration
      const tempAudio = new Audio(track.objectUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duration: tempAudio.duration } : t));
      });
      tempAudio.addEventListener('error', () => {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duration: 0 } : t));
      });

      // Resolve tags
      if ((window as any).jsmediatags) {
        (window as any).jsmediatags.read(track.file, {
          onSuccess: (tag: any) => {
            if (tag?.tags) {
              setTracks(prev => prev.map(t => {
                if (t.id === track.id) {
                  const updates: Partial<Track> = {};
                  if (tag.tags.title) updates.title = tag.tags.title;
                  if (tag.tags.artist) updates.artist = tag.tags.artist;
                  if (tag.tags.album) updates.album = tag.tags.album;
                  if (tag.tags.picture) {
                    const image = tag.tags.picture;
                    let base64 = "";
                    for (let i = 0; i < image.data.length; i++) {
                      base64 += String.fromCharCode(image.data[i]);
                    }
                    updates.artwork = `data:${image.format};base64,${btoa(base64)}`;
                  }
                  return { ...t, ...updates };
                }
                return t;
              }));
            }
          },
          onError: () => {}
        });
      }
    });
  }, [loadTrack, showToast]);

  const play = useCallback(() => {
    initAudioContext();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [initAudioContext]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrackIndex === -1 && tracks.length > 0) {
      loadTrack(0);
      return;
    }
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause, currentTrackIndex, tracks.length, loadTrack]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else {
      nextIdx = currentTrackIndex + 1;
      if (nextIdx >= tracks.length) {
        if (repeat === 'all') nextIdx = 0;
        else return;
      }
    }
    loadTrack(nextIdx);
  }, [tracks.length, currentTrackIndex, shuffle, repeat, loadTrack]);

  const previous = useCallback(() => {
    if (tracks.length === 0) return;
    if (currentTime > 3) {
      audioRef.current!.currentTime = 0;
      return;
    }
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = tracks.length - 1;
    loadTrack(prevIdx);
  }, [tracks.length, currentTrackIndex, currentTime, loadTrack]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1.5, Math.max(0, vol));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = Math.min(1, clamped);
    // Use gain node for boost above 100%
    if (gainRef.current) {
      gainRef.current.gain.value = clamped > 1 ? clamped : 1;
    }
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.volume = next ? 0 : volume;
      return next;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      showToast(!prev ? 'Shuffle ON' : 'Shuffle OFF');
      return !prev;
    });
  }, [showToast]);

  const cycleRepeat = useCallback(() => {
    setRepeat(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      showToast(`Repeat: ${next.toUpperCase()}`);
      return next;
    });
  }, [showToast]);

  const toggleLike = useCallback((id: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        showToast(t.liked ? 'Removed from favorites' : 'Added to favorites');
        return { ...t, liked: !t.liked };
      }
      return t;
    }));
  }, [showToast]);

  const setEQGain = useCallback((index: number, gain: number) => {
    if (filtersRef.current[index]) {
      filtersRef.current[index].gain.value = gain;
    }
    setEqBands(prev => prev.map((b, i) => i === index ? { ...b, gain } : b));
  }, []);

  const selectTrack = useCallback((index: number) => {
    loadTrack(index);
  }, [loadTrack]);

  const createPlaylist = useCallback((name: string) => {
    const pl: Playlist = { id: crypto.randomUUID(), name, trackIds: [] };
    setPlaylists(prev => [...prev, pl]);
    showToast(`Playlist "${name}" created`);
  }, [showToast]);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    ));
  }, []);

  const selectPlaylist = useCallback((id: string | null) => {
    setActivePlaylistId(id);
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks(prev => {
      const track = prev[index];
      if (track) URL.revokeObjectURL(track.objectUrl);
      if (track?.artwork) URL.revokeObjectURL(track.artwork);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const toggleEqualizer = useCallback(() => {
    setShowEqualizer(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekTo(Math.max(0, currentTime - 5)); break;
        case 'ArrowRight': e.preventDefault(); seekTo(Math.min(duration, currentTime + 5)); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(2, volume + 0.05)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 0.05)); break;
        case 'KeyN': nextTrack(); break;
        case 'KeyP': previous(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, seekTo, currentTime, duration, volume, setVolume, nextTrack, previous]);

  // Media session action handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', previous);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
  }, [play, pause, previous, nextTrack]);

  // Media session playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Media session metadata
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrackIndex >= 0 && tracks[currentTrackIndex]) {
      const track = tracks[currentTrackIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Unknown Album',
        artwork: track.artwork ? [{ src: track.artwork, sizes: '512x512', type: 'image/jpeg' }] : []
      });
    }
  }, [currentTrackIndex, tracks]);

  const value: ContextType = {
    tracks, currentTrackIndex, isPlaying, currentTime, duration, volume, isMuted,
    shuffle, repeat, eqBands, playlists, activePlaylistId, analyserNode, showEqualizer,
    toastMessage,
    addFiles, play, pause, togglePlay, next: nextTrack, previous, seekTo, setVolume,
    toggleMute, toggleShuffle, cycleRepeat, toggleLike, setEQGain, selectTrack,
    createPlaylist, addToPlaylist, selectPlaylist, removeTrack, toggleEqualizer, showToast,
  };

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
};
