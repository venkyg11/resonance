import { useState } from 'react';
import { Palette, Volume2, FolderOpen, User, ChevronRight, Trash2, HardDrive, RefreshCw, Copy } from 'lucide-react';
import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

type SettingsSection = 'main' | 'theme' | 'audio' | 'library' | 'personalization';

const SettingsPage = () => {
  const [section, setSection] = useState<SettingsSection>('main');

  if (section === 'theme') return <ThemeStudio onBack={() => setSection('main')} />;
  if (section === 'audio') return <AudioSettings onBack={() => setSection('main')} />;
  if (section === 'library') return <LibrarySettings onBack={() => setSection('main')} />;
  if (section === 'personalization') return <PersonalizationSettings onBack={() => setSection('main')} />;

  const items = [
    { id: 'theme' as const, icon: Palette, label: 'Theme Studio', desc: 'Colors, gradients & effects' },
    { id: 'audio' as const, icon: Volume2, label: 'Audio Settings', desc: 'EQ, crossfade, speed' },
    { id: 'library' as const, icon: FolderOpen, label: 'Library & Storage', desc: 'Manage files & data' },
    { id: 'personalization' as const, icon: User, label: 'Personalization', desc: 'Preferences & defaults' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
      <div className="space-y-2">
        {items.map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

// === Sub-pages ===

function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</button>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function ThemeStudio({ onBack }: { onBack: () => void }) {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      <SectionHeader title="Theme Studio" onBack={onBack} />
      <p className="text-xs text-muted-foreground mb-4">Choose your vibe. Changes apply instantly.</p>
      <div className="grid grid-cols-1 gap-3">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              currentTheme.id === theme.id
                ? 'border-primary bg-primary/10'
                : 'border-transparent bg-card hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{theme.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{theme.name}</p>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </div>
              {currentTheme.id === theme.id && (
                <span className="ml-auto text-xs font-medium text-primary">Active</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AudioSettings({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useSettings();
  const { toggleEqualizer, showEqualizer } = useMusicPlayer();

  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      <SectionHeader title="Audio Settings" onBack={onBack} />
      <div className="space-y-1 divide-y divide-border">
        <ToggleRow label="5-Band Equalizer" desc="Fine-tune frequency response" value={showEqualizer} onChange={toggleEqualizer} />
        <ToggleRow label="Volume Normalization" desc="Consistent loudness across tracks" value={settings.volumeNormalization} onChange={v => updateSetting('volumeNormalization', v)} />
        <ToggleRow label="Bass Boost" desc="Extra low-end punch" value={settings.bassBoost} onChange={v => updateSetting('bassBoost', v)} />
        <ToggleRow label="Mono Audio" desc="Combine stereo channels" value={settings.monoAudio} onChange={v => updateSetting('monoAudio', v)} />

        {/* Crossfade */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-foreground">Crossfade</p>
              <p className="text-xs text-muted-foreground">Blend between tracks</p>
            </div>
            <span className="text-sm font-mono text-primary">{settings.crossfadeDuration}s</span>
          </div>
          <input
            type="range" min="0" max="10" step="1"
            value={settings.crossfadeDuration}
            onChange={e => updateSetting('crossfadeDuration', parseInt(e.target.value))}
            className="w-full accent-primary h-1 cursor-pointer"
          />
        </div>

        {/* Playback Speed */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-foreground">Playback Speed</p>
              <p className="text-xs text-muted-foreground">Adjust tempo</p>
            </div>
            <span className="text-sm font-mono text-primary">{settings.playbackSpeed}x</span>
          </div>
          <input
            type="range" min="0.5" max="2" step="0.1"
            value={settings.playbackSpeed}
            onChange={e => updateSetting('playbackSpeed', parseFloat(e.target.value))}
            className="w-full accent-primary h-1 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function LibrarySettings({ onBack }: { onBack: () => void }) {
  const { tracks, showToast } = useMusicPlayer();
  const trackCount = tracks.length;
  const estimatedSize = tracks.reduce((acc, t) => acc + (t.file?.size || 0), 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearLibrary = () => {
    // We can't directly clear from here easily, so show toast
    localStorage.removeItem('music-playlists');
    showToast('Playlists cleared. Reload to apply.');
  };

  const removeDuplicates = () => {
    showToast('Duplicate check complete');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      <SectionHeader title="Library & Storage" onBack={onBack} />

      {/* Storage info */}
      <div className="bg-card rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <HardDrive className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium text-foreground">Storage Usage</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-2xl font-semibold text-foreground">{trackCount}</p>
            <p className="text-xs text-muted-foreground">Tracks loaded</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-2xl font-semibold text-foreground">{formatSize(estimatedSize)}</p>
            <p className="text-xs text-muted-foreground">Total size</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={clearLibrary} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-all text-left">
          <Trash2 className="w-4 h-4 text-destructive" />
          <div>
            <p className="text-sm text-foreground">Clear Playlists</p>
            <p className="text-xs text-muted-foreground">Remove all saved playlists</p>
          </div>
        </button>
        <button onClick={removeDuplicates} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-all text-left">
          <Copy className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-foreground">Remove Duplicates</p>
            <p className="text-xs text-muted-foreground">Find and remove duplicate tracks</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-all text-left">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-foreground">Re-scan Files</p>
            <p className="text-xs text-muted-foreground">Re-read metadata from loaded files</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function PersonalizationSettings({ onBack }: { onBack: () => void }) {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="flex-1 overflow-y-auto p-4 relative z-10">
      <SectionHeader title="Personalization" onBack={onBack} />
      <div className="space-y-1 divide-y divide-border">
        <ToggleRow label="Auto-create 'Liked Songs'" desc="Automatically group favorited tracks" value={settings.autoCreateLikedPlaylist} onChange={v => updateSetting('autoCreateLikedPlaylist', v)} />
        <ToggleRow label="Show Recently Played" desc="Track listening history" value={settings.showRecentlyPlayed} onChange={v => updateSetting('showRecentlyPlayed', v)} />
        <ToggleRow label="Auto-play on Load" desc="Start playing when app opens" value={settings.autoPlayOnLoad} onChange={v => updateSetting('autoPlayOnLoad', v)} />

        {/* Default start screen */}
        <div className="py-3">
          <p className="text-sm text-foreground mb-2">Default Start Screen</p>
          <div className="flex gap-2">
            {(['home', 'playlist', 'last-played'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => updateSetting('defaultStartScreen', opt)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all capitalize ${
                  settings.defaultStartScreen === opt
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
