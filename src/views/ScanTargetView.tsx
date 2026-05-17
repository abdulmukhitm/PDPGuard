import { useState } from 'react';
import { Search, Shield, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Loader2, Target, Globe, Server, ArrowRight } from 'lucide-react';

interface Vulnerability {
  id: string;
  nama_celah: string;
  tingkat_risiko: string;
  status: string;
}

export default function ScanTargetView() {
  const [targetUrl, setTargetUrl] = useState('');
  const [targetType, setTargetType] = useState('Website URL');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanResults, setScanResults] = useState<Vulnerability[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    
    setIsScanning(true);
    setHasScanned(false);
    setErrorMsg(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/system/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target: targetUrl, type: targetType })
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response format (expected JSON)');
      }

      setScanResults(Array.isArray(data) ? data : data.vulnerabilities || []);
      setHasScanned(true);
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setErrorMsg('Server unavailable. Please check if the backend is running.');
      } else {
        setErrorMsg(error.message || 'An unexpected error occurred while scanning.');
      }
      setHasScanned(false);
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'low':
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getRiskDot = (level: string) => {
    switch(level.toLowerCase()) {
      case 'critical':
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low':
      case 'info': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const hasHighRisk = scanResults.some(vuln => ['high', 'critical'].includes(vuln.tingkat_risiko.toLowerCase()));

  const getHighestRisk = () => {
    if (scanResults.length === 0) return 'None';
    if (scanResults.some(v => v.tingkat_risiko.toLowerCase() === 'critical')) return 'Critical';
    if (scanResults.some(v => v.tingkat_risiko.toLowerCase() === 'high')) return 'High';
    if (scanResults.some(v => v.tingkat_risiko.toLowerCase() === 'medium')) return 'Medium';
    if (scanResults.some(v => v.tingkat_risiko.toLowerCase() === 'low')) return 'Low';
    return 'Info';
  };

  const highestRisk = getHighestRisk();

  return (
    <div className="flex flex-col gap-8 h-full pb-8">
      {/* Target Input Section - Minimalist Dark / Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1121] border border-slate-800 p-8 sm:p-12 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            Vulnerability Scanner
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Protect your digital assets.
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10">
            Enter your domain, IP address, or API endpoint to perform a deep security analysis and check for PDP compliance.
          </p>
          
          <form onSubmit={handleScan} className="w-full relative shadow-lg group">
            <div className="flex justify-center gap-2 mb-6">
              {['Website URL', 'IP Address', 'API Endpoint'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTargetType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${targetType === type ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder={targetType === 'IP Address' ? 'e.g., 192.168.1.1' : targetType === 'API Endpoint' ? 'e.g., api.company.com/v1' : 'e.g., company.com'}
                className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-36 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                disabled={isScanning}
              />
              <button
                type="submit"
                disabled={isScanning || !targetUrl.trim()}
                className="absolute inset-y-1.5 right-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning
                  </>
                ) : (
                  <>
                    Mulai Scan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="w-full mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-left animate-in fade-in duration-300">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-400 mb-1">Scan Failed</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isScanning && (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-sm font-bold text-slate-900 uppercase tracking-widest">Analyzing Target...</p>
          <p className="text-xs text-slate-500 mt-2">Checking for vulnerabilities and configuration issues</p>
        </div>
      )}

      {/* Scan Results */}
      {hasScanned && !isScanning && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Celah</p>
                <h3 className="text-3xl font-bold text-slate-900">{scanResults.length}</h3>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Tingkat Risiko Tertinggi</p>
                <div className="flex items-center gap-2">
                  {highestRisk !== 'None' && (
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getRiskDot(highestRisk)}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${getRiskDot(highestRisk)}`}></span>
                    </span>
                  )}
                  <h3 className={`text-2xl font-bold uppercase ${
                    ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'text-red-600' :
                    highestRisk.toLowerCase() === 'medium' ? 'text-amber-600' :
                    ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'text-blue-600' :
                    'text-slate-900'
                  }`}>
                    {highestRisk}
                  </h3>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'bg-red-50' :
                highestRisk.toLowerCase() === 'medium' ? 'bg-amber-50' :
                ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'bg-blue-50' :
                'bg-slate-50'
              }`}>
                <ShieldAlert className={`w-6 h-6 ${
                  ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'text-red-500' :
                  highestRisk.toLowerCase() === 'medium' ? 'text-amber-500' :
                  ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'text-blue-500' :
                  'text-slate-500'
                }`} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Status PDP Compliance</p>
                <h3 className={`text-lg font-bold leading-tight ${hasHighRisk ? 'text-amber-600' : 'text-green-600'}`}>
                  {hasHighRisk ? 'Action Required' : 'PDP Compliant'}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasHighRisk ? 'bg-amber-50' : 'bg-green-50'}`}>
                {hasHighRisk ? (
                  <Shield className="w-6 h-6 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Detail Hasil Scan</h3>
              <span className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-md uppercase tracking-wider">{targetUrl}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 w-28">ID</th>
                    <th className="px-5 py-4">Nama Celah</th>
                    <th className="px-5 py-4 w-32">Tingkat Risiko</th>
                    <th className="px-5 py-4 w-48">Status Compliance</th>
                    <th className="px-5 py-4 w-36">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {scanResults.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4 font-mono font-bold text-slate-500">{vuln.id}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">{vuln.nama_celah}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${getRiskColor(vuln.tingkat_risiko)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getRiskDot(vuln.tingkat_risiko)}`}></span>
                          {vuln.tingkat_risiko}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {['high', 'critical'].includes(vuln.tingkat_risiko.toLowerCase()) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded text-red-700 bg-red-100 border border-red-200">
                            Pelanggaran PDP (Pasal 46)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded text-green-700 bg-green-100 border border-green-200">
                            PDP Compliant
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">{vuln.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

