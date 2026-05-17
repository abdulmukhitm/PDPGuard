import { useState, useEffect } from 'react';
import { LayoutDashboard, ScanSearch, FileCheck, Shield, Menu, Bell, Search, X, LogOut, LogIn, Sun, Moon, Sunset } from 'lucide-react';

import DashboardView from './views/DashboardView';
import ScanTargetView from './views/ScanTargetView';
import ComplianceReportView from './views/ComplianceReportView';
import { useAuth } from './contexts/AuthContext';

type ViewState = 'dashboard' | 'scan' | 'compliance';
type ThemeMode = 'light' | 'dark' | 'warm';

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const { user, loading, logout, login } = useAuth();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-warm');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan Target', icon: ScanSearch },
    { id: 'compliance', label: 'Compliance Report', icon: FileCheck },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-slate-800 font-sans underline-offset-4">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out lg:static shrink-0 overflow-hidden
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-0' : 'lg:w-64'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="p-5 flex items-center gap-3 border-b border-slate-800 shrink-0 h-16">
             <div className="w-8 h-8 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
               <Shield className="w-4 h-4 text-white" />
             </div>
             <span className="text-xl font-extrabold tracking-tight text-white truncate">PDPGuard</span>
            <button 
              className="ml-auto lg:hidden p-1 hover:bg-slate-800 rounded-md text-slate-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden space-y-1">
            <div className="px-6 py-2 text-xs uppercase tracking-widest text-slate-500 font-bold truncate">Main Menu</div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center py-3 px-6 gap-3 transition-colors text-sm font-semibold
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 relative before:w-1 before:h-full before:absolute before:left-0 before:top-0 before:bg-blue-600' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto bg-slate-900/40 border-t border-slate-800 shrink-0">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4 px-2">
                   <div className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-white text-sm font-bold shrink-0 uppercase shadow-sm">
                     {user.email ? user.email.substring(0, 2) : 'U'}
                   </div>
                   <div className="overflow-hidden flex-1 text-left">
                     <div className="text-sm font-bold text-slate-100 truncate">{user.displayName || 'Admin User'}</div>
                     <div className="text-xs text-slate-400 truncate">{user.email}</div>
                   </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-all border border-slate-700"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={login}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-900/20"
              >
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              className="hidden lg:block p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">Privacy Protection Overview</h1>
              <p className="text-xs text-slate-500">Last scan completed 14 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-full cursor-pointer border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {theme === 'light' && <><Sun className="w-4 h-4 text-slate-500" /><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Light</span></>}
                {theme === 'dark' && <><Moon className="w-4 h-4 text-slate-400" /><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Dark</span></>}
                {theme === 'warm' && <><Sunset className="w-4 h-4 text-amber-600" /><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Warm</span></>}
              </button>
              
              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-1.5 flex flex-col gap-1">
                      <button 
                        onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Light Mode
                      </button>
                      <button 
                        onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Dark Mode
                      </button>
                      <button 
                        onClick={() => { setTheme('warm'); setIsThemeMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${theme === 'warm' ? 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-500'}`}
                      >
                        <Sunset className={`w-4 h-4 ${theme === 'warm' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400'}`} /> Warm Mode
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-md gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs font-medium">All Systems Operational</span>
            </div>
            {user ? (
              <button 
                onClick={() => setActiveView('scan')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
              >
                Run Full Scan
              </button>
            ) : activeView === 'scan' ? (
              <button 
                onClick={login}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2"
              >
                Login to Scan
              </button>
            ) : null}
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="w-full min-h-full max-w-7xl mx-auto">
            {activeView === 'dashboard' && <DashboardView onScanClick={() => setActiveView('scan')} />}
            {activeView === 'scan' && <ScanTargetView />}
            {activeView === 'compliance' && <ComplianceReportView />}
          </div>
        </main>
      </div>
    </div>
  );
}
