import { Plus, RefreshCw, Music, Video } from 'lucide-react';
import { useRef, useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

interface HeaderProps {
  activeMode: 'music' | 'video';
  onModeChange: (mode: 'music' | 'video') => void;
}

const Header = ({ activeMode, onModeChange }: HeaderProps) => {
  const { addFiles, showToast } = useMusicPlayer();
  const inputRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    scanRef.current?.click();
    setTimeout(() => setScanning(false), 1000);
  };

  return (
    <header className="glass flex items-center justify-between px-6 py-3 z-10 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Resonance" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Resonance</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
          <button
            onClick={() => onModeChange('music')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'music'
                ? 'gradient-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>Music</span>
          </button>
          <button
            onClick={() => onModeChange('video')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'video'
                ? 'gradient-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Video</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleScan}
          className="glass-3d text-foreground p-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:scale-105"
          title={activeMode === 'music' ? "Scan for new audio files" : "Scan for video files"}
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="gradient-primary gradient-primary-hover text-primary-foreground px-3 py-2 sm:px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{activeMode === 'music' ? 'Add Music' : 'Add Video'}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={activeMode === 'music' ? "audio/*" : "video/*"}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            if (activeMode === 'music') {
              addFiles(e.target.files);
            } else {
              showToast('Video added (pending context integration)');
            }
          }
        }}
      />
      <input
        ref={scanRef}
        type="file"
        accept={activeMode === 'music' ? "audio/*" : "video/*"}
        multiple
        // @ts-ignore
        webkitdirectory=""
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (activeMode === 'music') {
              addFiles(e.target.files);
            } else {
              showToast(`${e.target.files.length} video files found`);
            }
          } else {
            showToast('No new files found');
          }
        }}
      />
    </header>
  );
};

export default Header;
