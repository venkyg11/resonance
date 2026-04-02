import { useRef, useEffect } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const Visualizer = () => {
  const { analyserNode, isPlaying } = useMusicPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'hsl(265 90% 60% / 0.6)');
      gradient.addColorStop(1, 'hsl(230 80% 60% / 0.6)');

      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    };

    if (isPlaying) {
      draw();
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [analyserNode, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
    />
  );
};

export default Visualizer;
