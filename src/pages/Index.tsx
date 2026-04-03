import { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { VideoPlayerProvider } from '@/contexts/VideoPlayerContext';

import AmbientBackground from '@/components/music/AmbientBackground';
import Header from '@/components/music/Header';
import TrackSidebar from '@/components/music/TrackSidebar';
import NowPlaying from '@/components/music/NowPlaying';
import Equalizer from '@/components/music/Equalizer';
import ControlBar from '@/components/music/ControlBar';
import DropZone from '@/components/music/DropZone';
import MiniPlayer from '@/components/music/MiniPlayer';
import Toast from '@/components/music/Toast';
import FooterNav, { type TabId } from '@/components/music/FooterNav';
import SearchPage from '@/components/music/SearchPage';
import LibraryPage from '@/components/music/LibraryPage';
import SettingsPage from '@/components/music/SettingsPage';
import VideoView from '@/components/video/VideoView';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeMode, setActiveMode] = useState<'music' | 'video'>('music');

  return (
    <ThemeProvider>
      <SettingsProvider>
        <MusicPlayerProvider>
          <VideoPlayerProvider>
            <DropZone>
              <div className="h-screen flex flex-col relative overflow-hidden">
                <AmbientBackground mode={activeMode} />
                <Header activeMode={activeMode} onModeChange={setActiveMode} />
                
                <div className="flex flex-1 overflow-hidden relative z-10 animate-fade-in" key={activeMode}>
                  {activeMode === 'music' ? (
                    <>
                      {/* Desktop sidebar - always visible */}
                      <div className="hidden md:flex w-80 border-r border-border">
                        <TrackSidebar />
                      </div>
                      {/* Main content area */}
                      <main className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'home' && (
                          <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-10">
                            <div className="flex flex-col min-h-full md:min-h-0">
                              <NowPlaying />
                              <Equalizer />
                            </div>
                            {/* Upcoming Songs - Mobile View Only */}
                            <div className="md:hidden mt-2 h-[450px] border-t border-border/50">
                              <TrackSidebar hidePlaylists={true} title="Upcoming Songs" />
                            </div>
                          </div>
                        )}
                        {activeTab === 'search' && <SearchPage />}
                        {activeTab === 'library' && <LibraryPage />}
                        {activeTab === 'settings' && <SettingsPage />}
                      </main>
                    </>
                  ) : (
                    <VideoView />
                  )}
                </div>

                {/* Shared Controls */}
                <div className="hidden md:block px-3 pb-1.5 pt-1 relative z-20">
                  <ControlBar activeMode={activeMode} />
                </div>
                <div className="md:hidden px-3 pb-1.5 pt-1 relative z-20">
                  <MiniPlayer activeMode={activeMode} />
                </div>

                {/* Show navigation only in Music mode or if required */}
                {activeMode === 'music' && (
                  <div className="px-3 pb-2 pt-0.5 relative z-30">
                    <FooterNav activeTab={activeTab} onTabChange={setActiveTab} />
                  </div>
                )}
                <Toast />
              </div>
            </DropZone>
          </VideoPlayerProvider>
        </MusicPlayerProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default Index;
