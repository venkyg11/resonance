import { useState } from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoLibrary from '@/components/video/VideoLibrary';
import { ListVideo, X } from 'lucide-react';

const VideoView = () => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 h-full">
      {/* Video Player (70% on desktop, 100% on mobile minus drawer) */}
      <div className="flex-1 md:flex-[7] flex flex-col overflow-hidden bg-black/20 relative">
        <VideoPlayer />
        
        {/* Mobile Library Toggle Button */}
        <button 
          onClick={() => setIsLibraryOpen(true)}
          className="md:hidden absolute top-4 right-4 z-30 p-3 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary shadow-xl animate-fade-in"
        >
          <ListVideo className="w-6 h-6" />
        </button>
      </div>

      {/* Video Queue/Library (30% on desktop, Sliding Drawer on mobile) */}
      <div className={`
        fixed inset-0 z-[100] md:relative md:flex-[3] md:inset-auto md:z-auto
        transition-all duration-500 ease-in-out
        ${isLibraryOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:translate-y-0 md:opacity-100'}
        md:border-l md:border-border/50 md:bg-background/30 md:backdrop-blur-md flex flex-col overflow-hidden
      `}>
        {/* Mobile Drawer Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsLibraryOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className="relative mt-20 md:mt-0 h-full w-full bg-background/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none rounded-t-[40px] md:rounded-none border-t border-white/10 md:border-t-0 overflow-hidden flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.4)] md:shadow-none">
          {/* Mobile Handle */}
          <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto my-4" />
          
          <div className="flex-1 overflow-hidden">
            <VideoLibrary />
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsLibraryOpen(false)}
            className="md:hidden absolute top-4 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
