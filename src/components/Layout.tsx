import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  History, 
  Settings, 
  Users,
  LogOut,
  Zap,
  X,
  Menu,
  Fish,
  BarChart3,
  Shield
} from 'lucide-react';
import type { User } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/paper-trading', icon: TrendingUp, label: 'Demo Trading' },
  { path: '/backtest', icon: History, label: 'Backtesting' },
  { path: '/agents', icon: Bot, label: 'Strategies' },
  { path: '/market', icon: BarChart3, label: 'Market Analysis' },
  { path: '/whales', icon: Fish, label: 'Whale Tracking' },
  { path: '/risk', icon: Shield, label: 'Risk Management' },
];

const bottomNavItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout({ children, user, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 sidebar fixed h-full z-40">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8e745] flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Silver Lion</h1>
              <p className="text-xs text-[#c8e745]">AI Trading</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </NavLink>
          )}
          
          <button
            onClick={handleLogout}
            className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* User */}
        {user && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c8e745] to-[#a3d13a] flex items-center justify-center text-black font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 top-bar">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c8e745] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-base font-bold text-white">Silver Lion AI</h1>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#111] border-b border-white/5 p-4 animate-fade-in">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <div className="border-t border-white/5 my-2" />
              {bottomNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Admin Panel</span>
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default Layout;
