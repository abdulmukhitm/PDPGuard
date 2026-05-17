import { ShieldCheck, ShieldAlert, Activity, GitCommitHorizontal } from 'lucide-react';

export default function DashboardView() {
  const stats = [
    { label: 'Overall Compliance Score', value: '94%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Targets', value: '12', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Vulnerabilities', value: '3', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Scans Today', value: '1,204', icon: GitCommitHorizontal, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
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
           <div className="p-4 border-b border-slate-100 flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-900">Scan Activity</h3>
           </div>
           <div className="p-4 flex-1 flex flex-col">
             <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px]">
               {[40, 70, 45, 90, 65, 85, 100, 60, 40, 80, 50, 75].map((height, i) => (
                 <div key={i} className="w-full bg-slate-100 rounded-t-sm relative group">
                   <div 
                     className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400"
                     style={{ height: `${height}%` }}
                   ></div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mt-4 tracking-wider">
               <span>Feb 1</span>
               <span>Feb 15</span>
               <span>Feb 28</span>
             </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
             <h3 className="text-sm font-bold text-slate-900">Risk Alerts</h3>
          </div>
          <div className="p-4 flex-1 space-y-4">
            {[
              { target: 'api.production.com', issue: 'Missing SSL Pinning', time: '2h ago', level: 'high' },
              { target: 'internal-db-01', issue: 'Open Port 5432', time: '5h ago', level: 'critical' },
              { target: 'dashboard.web', issue: 'Outdated dependency', time: '1d ago', level: 'medium' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.level === 'critical' ? 'bg-red-500' : alert.level === 'high' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{alert.target}</p>
                  <p className="text-[10px] text-slate-500">{alert.issue}</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
