import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { get, set } from '../utils/db';
import { toast } from 'sonner';

export interface VideoTrack {
  id: string;
  file: File;
  title: string;
  duration: number;
  objectUrl: string;
  thumbnail?: string;
  size: number;
  resolution?: string;
}

interface VideoPlayerState {
  videos: VideoTrack[];
  currentVideoIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  brightness: number;
  contrast: number;
  aspectRatio: 'auto' | '16/9' | '4/3' | '21/9';
  isLooping: boolean;
  showPiP: boolean;
}

interface VideoPlayerActions {
  addVideos: (files: FileList | File[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setBrightness: (val: number) => void;
  setContrast: (val: number) => void;
  setAspectRatio: (ratio: VideoPlayerState['aspectRatio']) => void;
  toggleLoop: () => void;
  togglePiP: () => void;
  selectVideo: (index: number) => void;
  removeVideo: (index: number) => void;
  takeScreenshot: () => void;
  scanDirectory: () => Promise<void>;
}

type ContextType = VideoPlayerState & VideoPlayerActions;

const VideoPlayerContext = createContext<ContextType | null>(null);

export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error('useVideoPlayer must be used within VideoPlayerProvider');
  return ctx;
};

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<VideoTrack[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => {
    const saved = localStorage.getItem('aura-video-index');
    return saved ? parseInt(saved, 10) : -1;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem('aura-video-time');
    return saved ? parseFloat(saved) : 0;
  });
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('aura-video-volume');
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<VideoPlayerState['aspectRatio']>('auto');
  const [isLooping, setIsLooping] = useState(false);
  const [showPiP, setShowPiP] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Expose videoRef so UI components can attach to it
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) {
      // Re-apply current state to new element if needed
      el.volume = isMuted ? 0 : Math.min(1, volume);
      el.playbackRate = playbackSpeed;
      el.loop = isLooping;
    }
  }, [isMuted, volume, playbackSpeed, isLooping]);

  // Persistence
  useEffect(() => {
    get('saved-videos').then((saved: VideoTrack[]) => {
      if (saved && Array.isArray(saved)) {
        const restored = saved.map(v => ({
          ...v,
          objectUrl: v.file ? URL.createObjectURL(v.file) : v.objectUrl
        }));
        setVideos(restored);
        
        // Restore last state
        const sIdx = localStorage.getItem('aura-video-index');
        const sTime = localStorage.getItem('aura-video-time');
        if (sIdx !== null) {
          const idx = parseInt(sIdx, 10);
          if (idx >= 0 && idx < restored.length) {
            setCurrentVideoIndex(idx);
            if (sTime) setCurrentTime(parseFloat(sTime));
          }
        }
      }
    }).catch(console.error).finally(() => setIsDbLoaded(true));
  }, []);

  useEffect(() => {
    if (isDbLoaded) {
      set('saved-videos', videos).catch(console.error);
    }
  }, [videos, isDbLoaded]);

  // Persist index, time, volume
  useEffect(() => {
    if (isDbLoaded) {
      localStorage.setItem('aura-video-index', currentVideoIndex.toString());
    }
  }, [currentVideoIndex, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded && currentVideoIndex !== -1) {
      localStorage.setItem('aura-video-time', currentTime.toString());
    }
  }, [currentTime, currentVideoIndex, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('aura-video-volume', volume.toString());
  }, [volume]);

  const initAudio = useCallback(() => {
    if (!videoRef.current || audioCtxRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(videoRef.current);
      sourceRef.current = source;
      const gain = ctx.createGain();
      gainRef.current = gain;
      
      source.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
  }, []);

  const play = useCallback(() => {
    if (!videoRef.current) return;
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [initAudio]);

  const pause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current?.paused) play();
    else pause();
  }, [play, pause]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  }, []);

  const loadVideo = useCallback((index: number, autoplay = true) => {
    if (index < 0 || index >= videos.length) return;
    
    // Always set the index so UI components can render the <video> tag
    // The VideoPlayer component will handle the actual source loading and playback
    setCurrentVideoIndex(index);
    setCurrentTime(0);
    if (autoplay) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [videos.length]);

  const next = useCallback(() => {
    if (videos.length === 0) return;
    loadVideo((currentVideoIndex + 1) % videos.length);
  }, [videos.length, currentVideoIndex, loadVideo]);

  const previous = useCallback(() => {
    if (videos.length === 0) return;
    loadVideo((currentVideoIndex - 1 + videos.length) % videos.length);
  }, [videos.length, currentVideoIndex, loadVideo]);

  const toggleMute = useCallback(() => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    if (videoRef.current) videoRef.current.volume = nextVal ? 0 : Math.min(1, volume);
  }, [isMuted, volume]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1.5, Math.max(0, vol));
    setVolumeState(clamped);
    if (videoRef.current) videoRef.current.volume = Math.min(1, clamped);
    if (gainRef.current) gainRef.current.gain.value = clamped > 1 ? clamped : 1;
    if (clamped > 0) setIsMuted(false);
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setShowPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setShowPiP(true);
      }
    } catch (e) {
      console.error("PiP failed", e);
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const link = document.createElement('a');
    link.download = `aura-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const getVideoMetadata = async (file: File): Promise<{ duration: number; thumbnail: string; resolution: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        video.currentTime = Math.min(1, duration / 2); // Sample from middle
        
        // Finalize metadata retrieval after seeked
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 168;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          
          let resLabel = '';
          if (video.videoHeight >= 2160) resLabel = '4K';
          else if (video.videoHeight >= 1080) resLabel = '1080p';
          else if (video.videoHeight >= 720) resLabel = '720p';
          else resLabel = `${video.videoHeight}p`;

          resolve({ duration, thumbnail, resolution: resLabel });
          URL.revokeObjectURL(url);
        };
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: 0, thumbnail: '', resolution: 'Unknown' });
      };
    });
  };

  const addVideos = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('video/'));
    const invalidFiles = fileArray.filter(f => !f.type.startsWith('video/'));

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) are not supported video formats.`);
    }

    if (validFiles.length === 0) return;

    const newTracks: VideoTrack[] = await Promise.all(validFiles.map(async file => {
      const { duration, thumbnail, resolution } = await getVideoMetadata(file);
      return {
        id: crypto.randomUUID(),
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration,
        objectUrl: URL.createObjectURL(file),
        thumbnail,
        size: file.size,
        resolution
      };
    }));

    setVideos(prev => {
      const updated = [...prev, ...newTracks];
      toast.success(`Added ${newTracks.length} video(s) to library`);
      if (prev.length === 0 && newTracks.length > 0) {
        setTimeout(() => loadVideo(0, false), 100);
      }
      return updated;
    });
  }, [loadVideo]);

  const scanDirectory = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('Directory scanning not supported');
    }
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      const files: File[] = [];
      async function scan(entry: any) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (file.type.startsWith('video/')) files.push(file);
        } else if (entry.kind === 'directory') {
          // @ts-ignore
          for await (const child of entry.values()) {
            await scan(child);
          }
        }
      }
      await scan(handle);
      if (files.length > 0) await addVideos(files);
    } catch (e) {
      console.error(e);
    }
  }, [addVideos]);

  // Keyboard shortcuts for Video Mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (currentVideoIndex === -1 || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekTo(Math.max(0, currentTime - 10)); break;
        case 'ArrowRight': e.preventDefault(); seekTo(Math.min(duration, currentTime + 10)); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(2, volume + 0.05)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 0.05)); break;
        case 'KeyF': 
          e.preventDefault(); 
          if (!document.fullscreenElement) {
            document.getElementById('aura-main-video')?.parentElement?.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyP': e.preventDefault(); togglePiP(); break;
        case 'BracketLeft': e.preventDefault(); setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.25)); break;
        case 'BracketRight': e.preventDefault(); setPlaybackSpeed(Math.min(4, playbackSpeed + 0.25)); break;
        case 'KeyB': e.preventDefault(); takeScreenshot(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, seekTo, currentTime, duration, volume, setVolume, toggleMute, playbackSpeed, takeScreenshot, currentVideoIndex, togglePiP]);

  // Media Session for Video
  useEffect(() => {
    if ('mediaSession' in navigator && currentVideoIndex >= 0 && videos[currentVideoIndex]) {
      const video = videos[currentVideoIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: video.title,
        artist: 'AURA Video',
        artwork: video.thumbnail ? [{ src: video.thumbnail, sizes: '512x512', type: 'image/jpeg' }] : []
      });

      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', previous);
      navigator.mediaSession.setActionHandler('nexttrack', next);
    }
  }, [currentVideoIndex, videos, play, pause, previous, next]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const value: ContextType = {
    videos, currentVideoIndex, isPlaying, currentTime, duration,
    volume, isMuted, playbackSpeed, brightness, contrast, aspectRatio,
    isLooping, showPiP,
    addVideos, play, pause, togglePlay, next, previous, seekTo, setVolume,
    toggleMute, 
    setPlaybackSpeed: (s) => { 
      setPlaybackSpeed(s); 
      if (videoRef.current) videoRef.current.playbackRate = s; 
    },
    setBrightness, setContrast, setAspectRatio,
    toggleLoop: () => setIsLooping(!isLooping),
    togglePiP, selectVideo: loadVideo,
    removeVideo: (i) => {
      setVideos(prev => {
        const video = prev[i];
        if (video) {
          URL.revokeObjectURL(video.objectUrl);
          toast.info(`Removed "${video.title}" from library`);
        }
        const updated = prev.filter((_, idx) => idx !== i);
        
        // Handle current selection shift
        if (i === currentVideoIndex) {
          setCurrentVideoIndex(-1); // Reset if current is removed
          if (videoRef.current) videoRef.current.src = '';
        } else if (i < currentVideoIndex) {
          setCurrentVideoIndex(prevIdx => prevIdx - 1);
        }
        
        return updated;
      });
    },
    takeScreenshot, scanDirectory,
// @ts-ignore
    setVideoRef, setCurrentTime, setDuration, setIsPlaying
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};
