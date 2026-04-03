import { useState } from 'react';
import { useVideoPlayer, type VideoTrack } from '@/contexts/VideoPlayerContext';
import { 
  FolderOpen, Plus, Search, Film, Clock, HardDrive, 
  Trash2, X, AlertCircle, Loader2, GripVertical
} from 'lucide-react';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const VideoLibrary = () => {
  const { 
    videos, currentVideoIndex, selectVideo, removeVideo, 
    addVideos, scanDirectory 
  } = useVideoPlayer();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScanClick = () => {
    setShowPermissionModal(true);
  };

  const startScan = async () => {
    setShowPermissionModal(false);
    setIsScanning(true);
    try {
      await scanDirectory();
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Area */}
      <div className="p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Video Library</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {videos.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleScanClick}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-all"
              title="Folder Scan"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <label className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              <input 
                type="file" multiple accept="video/*" className="hidden" 
                onChange={(e) => e.target.files && addVideos(Array.from(e.target.files))}
              />
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Library List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-24">
        {isScanning ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            <p className="text-sm font-medium animate-pulse">Scanning local drive...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <Film className="w-12 h-12 mb-2" />
            <p className="text-sm">No videos found</p>
          </div>
        ) : (
          filteredVideos.map((video, index) => {
            const isActive = videos.indexOf(video) === currentVideoIndex;
            return (
              <div 
                key={video.id}
                draggable
                className={`group relative flex gap-3 p-2 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10 ${
                  isActive ? 'bg-primary/10 border-primary/20 shadow-lg' : 'hover:bg-white/5'
                }`}
                onClick={() => selectVideo(videos.indexOf(video))}
              >
                {/* Drag Handle (Desktop) */}
                <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-inner">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Film className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {/* Duration Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white backdrop-blur-md">
                    {formatTime(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {video.title}
                  </h4>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Clock className="w-3 h-3 text-primary/60" /> {formatTime(video.duration)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <HardDrive className="w-3 h-3 text-primary/60" /> {formatBytes(video.size)}
                    </span>
                    {video.resolution && (
                      <span className="px-1 py-0.5 rounded-sm bg-white/5 text-[8px] text-white/50 font-bold border border-white/5">
                        {video.resolution}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeVideo(videos.indexOf(video)); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border/50 rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Allow folder access?</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              AURA will scan your selected folder for video files. 
              Your files stay on your device — nothing is uploaded.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={startScan}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Allow Access
              </button>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-3 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
