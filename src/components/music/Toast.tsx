import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const Toast = () => {
  const { toastMessage } = useMusicPlayer();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="glass rounded-full px-5 py-2 text-sm font-medium text-foreground shadow-xl">
        {toastMessage}
      </div>
    </div>
  );
};

export default Toast;
