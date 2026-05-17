import { ShieldCheck, ShieldAlert, Activity, GitCommitHorizontal, Target } from 'lucide-react';

interface DashboardViewProps {
  onScanClick?: () => void;
}

export default function DashboardView({ onScanClick }: DashboardViewProps) {
  const stats = [
    { label: 'Overall Compliance Score', value: '94%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Targets', value: '12', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Vulnerabilities', value: '3', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Scans Today', value: '1,204', icon: GitCommitHorizontal, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="flex flex-col min-h-full gap-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor your system security and PDP compliance status.</p>
        </div>
        <button 
          onClick={onScanClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-900/20 whitespace-nowrap self-start sm:self-auto"
        >
          <Target className="w-4 h-4" />
          <span>Get Started</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           <div className="p-5 border-b border-slate-100 flex items-center justify-between">
             <h3 className="text-sm font-extrabold text-slate-900">Scan Activity</h3>
           </div>
           <div className="p-5 flex-1 flex flex-col">
             <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 min-h-[240px]">
               {[40, 70, 45, 90, 65, 85, 100, 60, 40, 80, 50, 75].map((height, i) => (
                 <div key={i} className="w-full bg-slate-100 rounded-t-md relative group h-full flex items-end">
                   <div 
                     className="w-full bg-blue-500 rounded-t-md transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                     style={{ height: `${height}%` }}
                   ></div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between text-xs uppercase font-extrabold text-slate-400 mt-6 tracking-widest">
               <span>Feb 1</span>
               <span>Feb 15</span>
               <span>Feb 28</span>
             </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100">
             <h3 className="text-sm font-extrabold text-slate-900">Risk Alerts</h3>
          </div>
          <div className="p-5 flex-1 space-y-5">
            {[
              { target: 'api.production.com', issue: 'Missing SSL Pinning', time: '2h ago', level: 'high' },
              { target: 'internal-db-01', issue: 'Open Port 5432', time: '5h ago', level: 'critical' },
              { target: 'dashboard.web', issue: 'Outdated dependency', time: '1d ago', level: 'medium' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-4 pb-5 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors -mx-2 px-2 rounded-lg cursor-default">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${alert.level === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : alert.level === 'high' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{alert.target}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.issue}</p>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
