import { useState } from 'react';
import { LayoutDashboard, ScanSearch, FileCheck, Shield, Menu, Bell, Search, X } from 'lucide-react';

import DashboardView from './views/DashboardView';
import ScanTargetView from './views/ScanTargetView';
import ComplianceReportView from './views/ComplianceReportView';

type ViewState = 'dashboard' | 'scan' | 'compliance';

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan Target', icon: ScanSearch },
    { id: 'compliance', label: 'Compliance Report', icon: FileCheck },
  ] as const;

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
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
             <Shield className="w-4 h-4 text-white" />
           </div>
           <span className="text-xl font-bold tracking-tight text-white">PDPGuard</span>
          <button 
            className="ml-auto lg:hidden p-1 hover:bg-slate-800 rounded-md text-slate-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-6 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Main Menu</div>
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
                  w-full flex items-center gap-3 px-6 py-3 transition-colors text-sm font-medium
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto bg-slate-900/50 border-t border-slate-800 absolute bottom-0 w-full lg:static">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
               AM
             </div>
             <div className="overflow-hidden flex-1 text-left">
               <div className="text-xs font-semibold text-white truncate">Admin User</div>
               <div className="text-[10px] text-slate-500 truncate">Enterprise Plan</div>
             </div>
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
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">Privacy Protection Overview</h1>
              <p className="text-xs text-slate-500">Last scan completed 14 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-md gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs font-medium">All Systems Operational</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors">
              Run Full Scan
            </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="w-full h-full max-w-7xl mx-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'scan' && <ScanTargetView />}
            {activeView === 'compliance' && <ComplianceReportView />}
          </div>
        </main>
      </div>
    </div>
  );
}
