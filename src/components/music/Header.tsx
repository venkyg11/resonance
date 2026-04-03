import { Plus, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const Header = () => {
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
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Resonance" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Resonance</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleScan}
          className="glass-3d text-foreground p-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:scale-105"
          title="Scan for new audio files"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="gradient-primary gradient-primary-hover text-primary-foreground px-3 py-2 sm:px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Music</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
      <input
        ref={scanRef}
        type="file"
        accept="audio/*"
        multiple
        // @ts-ignore
        webkitdirectory=""
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
          } else {
            showToast('No new audio files found');
          }
        }}
      />
    </header>
  );
};

export default Header;
