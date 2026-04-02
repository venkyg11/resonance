import { Home, Search, Library, Settings } from 'lucide-react';

export type TabId = 'home' | 'search' | 'library' | 'settings';

interface FooterNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const FooterNav = ({ activeTab, onTabChange }: FooterNavProps) => {
  return (
    <nav className="glass-3d rounded-2xl relative h-[64px] flex items-center justify-center">
      <div className="flex items-center justify-around w-full px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center gap-1 px-3 rounded-lg transition-all ${
              activeTab === id
                ? 'text-primary transform scale-105'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default FooterNav;
