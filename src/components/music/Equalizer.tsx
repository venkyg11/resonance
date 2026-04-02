import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Zap } from 'lucide-react';

const Equalizer = () => {
  const { eqBands, setEQGain, showEqualizer, volume, setVolume, isMuted } = useMusicPlayer();

  if (!showEqualizer) return null;

  return (
    <div className="glass rounded-xl p-4 mx-4 mb-4 animate-scale-in">
      <div className="flex items-center justify-between mb-3 w-full">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equalizer</h3>
        
        {/* Vol. Boost 200 Controls aligned with header Add Music symbol */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative w-24 sm:w-32 hidden sm:block">
            <input
              title="Volume Boost Bar"
              type="range" min="0" max="2" step="0.01"
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 cursor-pointer appearance-none rounded-full bg-secondary"
              style={{
                background: `linear-gradient(to right, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) ${Math.min(volume, 1) * 50}%, 
                  ${volume > 1 ? `hsl(30 90% 50%) ${50}%, hsl(0 80% 50%) ${Math.min(volume / 2, 1) * 100}%` : `hsl(var(--muted)) ${Math.min(volume, 1) * 50}%`}, 
                  hsl(var(--muted)) 100%)`,
              }}
            />
          </div>
          <span className={`text-[10px] font-mono w-8 text-right hidden sm:block ${volume > 1 ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
            {Math.round(volume * 100)}%
          </span>
          <button 
            title="Vol. Boost Button"
            onClick={() => setVolume(volume > 1 ? 1 : 2)} 
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${volume > 1 ? 'bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        {eqBands.map((band, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs font-mono text-muted-foreground">{band.gain > 0 ? '+' : ''}{band.gain.toFixed(0)}dB</span>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={band.gain}
              onChange={e => setEQGain(i, parseFloat(e.target.value))}
              className="w-full accent-primary h-1 cursor-pointer"
              style={{ writingMode: 'vertical-lr' as any, height: 80 }}
            />
            <span className="text-xs text-muted-foreground">{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
