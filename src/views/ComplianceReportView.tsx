import { FileText, Download, Shield, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ComplianceReportView() {
  const frameworks = [
    { name: 'UU PDP (Indonesia)', score: 92, status: 'Compliant', date: 'Oct 2023', icon: ShieldCheck },
    { name: 'GDPR (EU)', score: 85, status: 'Review Needed', date: 'Ongoing', icon: Shield },
    { name: 'ISO 27001', score: 98, status: 'Certified', date: 'Jan 2024', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col min-h-full gap-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Compliance Reports</h1>
          <p className="text-xs text-slate-500">Track regulatory adherence and generate audit reports.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {frameworks.map((fw, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-inner">
                <fw.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-none">{fw.name}</h3>
            </div>
            
            <div className="mb-5">
              <div className="flex justify-between text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">
                <span>Compliance Score</span>
                <span className="text-slate-900">{fw.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${fw.score > 90 ? 'bg-green-500' : fw.score > 80 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${fw.score}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wide inline-flex items-center gap-1.5 border ${
                fw.status === 'Compliant' || fw.status === 'Certified' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {fw.status}
              </span>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 group p-1.5 hover:bg-blue-50 rounded-md transition-colors">
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100">
           <h3 className="text-sm font-extrabold text-slate-900">Recent Generated Reports</h3>
        </div>
        <div className="divide-y divide-slate-100">
           {[
             { title: 'Q1 2024 Privacy Impact Assessment', type: 'PDF', size: '2.4 MB', date: 'Today, 09:41 AM' },
             { title: 'Data Processing Agreement Audit', type: 'CSV', size: '156 KB', date: 'Yesterday, 14:20 PM' },
             { title: 'Vendor Security Review - AWS', type: 'PDF', size: '4.1 MB', date: 'Feb 12, 2024' },
             { title: 'Weekly Vulnerability Summary', type: 'PDF', size: '1.2 MB', date: 'Feb 10, 2024' },
           ].map((doc, i) => (
             <div key={i} className="p-4 sm:px-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                   <FileText className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-900 mb-0.5">{doc.title}</p>
                   <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                     <span className="uppercase font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{doc.type}</span>
                     <span>•</span>
                     <span>{doc.size}</span>
                     <span className="hidden sm:inline">•</span>
                     <span className="hidden sm:inline">{doc.date}</span>
                   </div>
                   <div className="block sm:hidden text-xs text-slate-400 mt-1">{doc.date}</div>
                 </div>
               </div>
               <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 ring-1 ring-slate-200 sm:ring-0">
                 <Download className="w-4 h-4" />
               </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
