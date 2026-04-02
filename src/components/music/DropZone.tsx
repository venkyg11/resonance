import { useState, useCallback } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Upload } from 'lucide-react';

const DropZone = ({ children }: { children: React.ReactNode }) => {
  const { addFiles } = useMusicPlayer();
  const [dragging, setDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) setDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  return (
    <div
      className="relative h-full"
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
    >
      {children}
      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl p-12 flex flex-col items-center gap-4 glow-primary">
            <Upload className="w-12 h-12 text-primary" />
            <p className="text-lg font-medium text-foreground">Drop audio files here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
