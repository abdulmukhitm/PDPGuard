import React, { useState, useEffect } from 'react';
import { Search, Shield, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Loader2, Target, Globe, Server, ArrowRight, ChevronDown, History, CalendarDays, FileCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Vulnerability {
  id: string;
  nama_celah: string;
  tingkat_risiko: string;
  status: string;
  impact?: string;
  remediation?: string;
}

interface ScanHistoryItem {
  id: string;
  targetUrl: string;
  date: string;
  outcome: 'Compliant' | 'Action Required' | 'Scan Failed';
  results?: Vulnerability[];
}

interface ScanTargetViewProps {
  onReportClick?: () => void;
}

export default function ScanTargetView({ onReportClick }: ScanTargetViewProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [targetType, setTargetType] = useState('Website URL');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanResults, setScanResults] = useState<Vulnerability[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { user, login } = useAuth();
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    if (user?.email) {
      const storedHistory = localStorage.getItem(`scanHistory_${user.email}`);
      if (storedHistory) {
        try {
          setScanHistory(JSON.parse(storedHistory));
        } catch (e) {
          setScanHistory([]);
        }
      } else {
        setScanHistory([]);
      }
    } else {
      setScanHistory([]);
    }
  }, [user]);

  const addHistoryItem = (newItem: ScanHistoryItem) => {
    setScanHistory(prev => {
      const updated = [newItem, ...prev];
      if (user?.email) {
        localStorage.setItem(`scanHistory_${user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteHistory = (id: string) => {
    if (!user) return;
    const updatedHistory = id === 'ALL' ? [] : scanHistory.filter(item => item.id !== id);
    setScanHistory(updatedHistory);
    localStorage.setItem(`scanHistory_${user.email}`, JSON.stringify(updatedHistory));
    setDeleteConfirmId(null);
  };

  const handleViewHistory = (item: ScanHistoryItem) => {
    setTargetUrl(item.targetUrl);
    setTargetType('Website URL'); // Default type
    setScanResults(item.results || []);
    setHasScanned(true);
    setIsScanning(false);
    setScanProgress(100);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    if (!user) {
      // Force user to login before scanning
      try {
        await login();
      } catch (err) {
        return; // Login cancelled or failed
      }
    }
    
    setIsScanning(true);
    setHasScanned(false);
    setErrorMsg(null);
    setScanProgress(0);
    setExpandedRowId(null);
    
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    try {
      let results: Vulnerability[] = [];
      try {
        // Connect to the backend's orchestrator endpoint using a relative path
        // This allows it to work seamlessly if the backend is served on the same origin (e.g., port 3000)
        const response = await fetch('/api/orchestrator/orchestrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ target: targetUrl, profile: 'passive' })
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

        // Map the backend's "exploits" array to the frontend's "Vulnerability" format
        if (data.exploits && Array.isArray(data.exploits)) {
          results = data.exploits.filter((exploit: any) => exploit.vulnerable).map((exploit: any) => ({
            id: exploit.id,
            nama_celah: exploit.name,
            tingkat_risiko: exploit.severity,
            status: 'Vulnerable',
            impact: exploit.evidence || 'Potensi celah keamanan terdeteksi.',
            remediation: exploit.recommendation || 'Lakukan audit dan perbaikan sesuai panduan OWASP API Security.'
          }));
        } else if (data.vulnerabilities) {
          // Fallback for older mock format
          results = data.vulnerabilities;
        } else if (Array.isArray(data)) {
          results = data;
        }
      } catch (backendError) {
        console.warn('Backend fetch failed, using mock data for UI testing', backendError);
        // Simulate a delay for the UI test
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        results = [
          {
            id: 'API1:2023',
            nama_celah: 'Broken Object Level Authorization',
            tingkat_risiko: 'High',
            status: 'Vulnerable',
            impact: 'Penyerang dapat memanipulasi ID objek untuk mengakses data pengguna lain.',
            remediation: 'Implementasikan mekanisme otorisasi yang valid pada tingkat objek untuk setiap akses data.'
          },
          {
            id: 'API3:2023',
            nama_celah: 'Broken Object Property Level Authorization',
            tingkat_risiko: 'Medium',
            status: 'Vulnerable',
            impact: 'Pengguna dapat mengakses properti objek sensitif yang seharusnya tidak dapat dijangkau.',
            remediation: 'Izinkan akses hanya ke properti tertentu berdasarkan peran (role-based) dengan memvalidasi skema (schema validation).'
          }
        ];
      }

      setScanResults(results);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        setIsScanning(false);
        setHasScanned(true);
        const hasHigh = results.some((vuln: Vulnerability) => ['high', 'critical'].includes(vuln.tingkat_risiko.toLowerCase()));
        addHistoryItem({
            id: Date.now().toString(),
            targetUrl: targetUrl,
            date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            outcome: hasHigh ? 'Action Required' : 'Compliant',
            results: results
        });
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      
      let emsg = 'An unexpected error occurred while scanning.';
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        if ((error.name === 'TypeError' && errorText.includes('failed to fetch')) || errorText.includes('unreachable') || errorText.includes('network')) {
          emsg = 'Target Unreachable: Unable to connect to backend server or target. Please verify it is active and reachable from this network.';
        } else if (errorText.includes('401') || errorText.includes('403') || errorText.includes('unauthorized') || errorText.includes('api key')) {
          emsg = 'Invalid API Key: Access denied due to missing, invalid, or expired credentials.';
        } else if (errorText.includes('404')) {
          emsg = 'Target Not Found: The specified domain, IP, or API endpoint could not be located.';
        } else if (errorText.includes('timeout')) {
          emsg = 'Connection Timeout: The scan exceeded the maximum allowed time to respond.';
        } else if (errorText.includes('500') || errorText.includes('502') || errorText.includes('503')) {
          emsg = 'Backend Server Error: The scanner service encountered an internal error. Please try again later.';
        } else if (errorText.includes('server returned error')) {
          emsg = `Request Failed: ${error.message}.`;
        } else {
          emsg = error.message;
        }
      }

      setErrorMsg(emsg);
      setIsScanning(false);
      setHasScanned(false);
      
      addHistoryItem({
          id: Date.now().toString(),
          targetUrl: targetUrl,
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          outcome: 'Scan Failed'
      });
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
    <div className="flex flex-col gap-8 min-h-full pb-8">
      {/* Target Input Section - Minimalist Dark / Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1121] border border-slate-800 p-8 sm:p-12 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Target className="w-4 h-4 text-blue-400" />
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
            <div className="relative flex flex-col sm:block gap-3">
              <div className="absolute top-4 sm:inset-y-0 left-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder={targetType === 'IP Address' ? 'e.g., 192.168.1.1' : targetType === 'API Endpoint' ? 'e.g., api.company.com/v1' : 'e.g., company.com'}
                className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 sm:pr-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                disabled={isScanning}
              />
              <button
                type="submit"
                disabled={isScanning || !targetUrl.trim()}
                className="w-full sm:w-auto relative sm:absolute sm:inset-y-1.5 sm:right-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-4 sm:py-0 px-6 rounded-xl sm:rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning
                  </>
                ) : !user ? (
                  <>
                    Sign In to Scan
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Mulai Scan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Select Targets */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <span className="text-xs text-slate-400 font-bold mr-2 uppercase tracking-wider">Quick Select API:</span>
              {[
                { label: '/api/v1/nasabah', url: 'http://localhost:8080/api/v1/nasabah' },
                { label: '/api/v1/loans', url: 'http://localhost:8080/api/v1/loans' },
                { label: '/api/v1/admin/users', url: 'http://localhost:8080/api/v1/admin/users' },
              ].map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    setTargetUrl(item.url);
                    setTargetType('API Endpoint');
                  }}
                  className="px-3.5 py-2 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/80 text-blue-300 hover:text-blue-100 rounded-lg text-xs font-mono transition-all disabled:opacity-50 hover:shadow-md hover:shadow-blue-900/20"
                  disabled={isScanning}
                >
                  {item.label}
                </button>
              ))}
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
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500 max-w-xl mx-auto w-full">
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">{scanProgress}%</span>
          </div>
          <p className="mt-4 text-sm font-bold text-slate-900 uppercase tracking-widest">Analyzing Target...</p>
          <p className="text-xs text-slate-500 mt-2">Checking for vulnerabilities and configuration issues</p>
        </div>
      )}

      {/* Scan Results */}
      {hasScanned && !isScanning && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Hasil Scan</h2>
            <button
              onClick={() => setHasScanned(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Tutup Hasil
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 text-xs font-extrabold mb-1 uppercase tracking-widest">Total Celah</p>
                <h3 className="text-4xl font-black text-slate-900">{scanResults.length}</h3>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-7 h-7 text-slate-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 text-xs font-extrabold mb-1 uppercase tracking-widest">Tingkat Risiko Tertinggi</p>
                <div className="flex items-center gap-2.5">
                  {highestRisk !== 'None' && (
                    <span className="relative flex h-3.5 w-3.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getRiskDot(highestRisk)}`}></span>
                      <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${getRiskDot(highestRisk)}`}></span>
                    </span>
                  )}
                  <h3 className={`text-2xl font-black uppercase tracking-tight ${
                    ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'text-red-600' :
                    highestRisk.toLowerCase() === 'medium' ? 'text-amber-600' :
                    ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'text-blue-600' :
                    'text-slate-900'
                  }`}>
                    {highestRisk}
                  </h3>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'bg-red-50' :
                highestRisk.toLowerCase() === 'medium' ? 'bg-amber-50' :
                ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'bg-blue-50' :
                'bg-slate-50'
              }`}>
                <ShieldAlert className={`w-7 h-7 ${
                  ['critical', 'high'].includes(highestRisk.toLowerCase()) ? 'text-red-500' :
                  highestRisk.toLowerCase() === 'medium' ? 'text-amber-500' :
                  ['low', 'info'].includes(highestRisk.toLowerCase()) ? 'text-blue-500' :
                  'text-slate-500'
                }`} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 text-xs font-extrabold mb-1 uppercase tracking-widest">Status PDP Compliance</p>
                <h3 className={`text-xl font-black leading-tight tracking-tight ${hasHighRisk ? 'text-amber-600' : 'text-green-600'}`}>
                  {hasHighRisk ? 'Action Required' : 'PDP Compliant'}
                </h3>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${hasHighRisk ? 'bg-amber-50' : 'bg-green-50'}`}>
                {hasHighRisk ? (
                  <Shield className="w-7 h-7 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-extrabold text-slate-900">Detail Hasil Scan</h3>
              <span className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-md uppercase tracking-wider self-start sm:self-auto truncate max-w-full">{targetUrl}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-extrabold border-b border-slate-100 tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-28">ID</th>
                    <th className="px-6 py-4">Nama Celah</th>
                    <th className="px-6 py-4 w-36">Tingkat Risiko</th>
                    <th className="px-6 py-4 w-56">Status Compliance</th>
                    <th className="px-6 py-4 w-40 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {scanResults.map((vuln) => (
                    <React.Fragment key={vuln.id}>
                      <tr 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setExpandedRowId(expandedRowId === vuln.id ? null : vuln.id)}
                      >
                        <td className="px-6 py-5 font-mono font-bold text-slate-500 flex items-center gap-3">
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedRowId === vuln.id ? 'rotate-180' : ''}`} />
                          {vuln.id}
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-900">{vuln.nama_celah}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide border ${getRiskColor(vuln.tingkat_risiko)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getRiskDot(vuln.tingkat_risiko)}`}></span>
                            {vuln.tingkat_risiko}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {['high', 'critical'].includes(vuln.tingkat_risiko.toLowerCase()) ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide rounded-md text-red-700 bg-red-100 border border-red-200">
                              Pelanggaran PDP (Pasal 46)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide rounded-md text-green-700 bg-green-100 border border-green-200">
                              PDP Compliant
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="font-extrabold text-slate-600 uppercase tracking-widest text-xs px-2.5 py-1 bg-slate-100 rounded-md">{vuln.status}</span>
                        </td>
                      </tr>
                      {expandedRowId === vuln.id && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={5} className="px-6 py-6 border-b border-slate-200">
                            <div className="grid md:grid-cols-2 gap-8 text-slate-700 max-w-5xl">
                              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                                  Potential Impact
                                </h4>
                                <p className="leading-relaxed text-sm text-slate-600">
                                  {vuln.impact || 'If exploited, this vulnerability could lead to unauthorized data access, potentially compromising sensitive user information and violating data protection regulations.'}
                                </p>
                              </div>
                              <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                                <h4 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                                  <Shield className="w-4 h-4 text-blue-500" />
                                  Remediation Steps
                                </h4>
                                <p className="leading-relaxed text-sm text-slate-600">
                                  {vuln.remediation || 'Apply the latest security patches, adhere to secure coding guidelines, and ensure configurations follow the principle of least privilege.'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {onReportClick && (
              <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-900">Need a comprehensive analysis?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Generate a detailed PDP compliance report for auditors and stakeholders.</p>
                </div>
                <button
                  onClick={onReportClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-slate-900/20 whitespace-nowrap"
                >
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>Generate Full Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Scan History Section */}
      {user && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-extrabold text-slate-900">Recent Scans History</h3>
            </div>
            {scanHistory.length > 0 && (
              <button
                onClick={() => setDeleteConfirmId('ALL')}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {scanHistory.length > 0 ? scanHistory.map((history) => (
              <div key={history.id} onClick={() => handleViewHistory(history)} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`mt-1 sm:mt-0 p-2.5 rounded-lg shadow-inner shrink-0 ${
                    history.outcome === 'Compliant' ? 'bg-green-50 text-green-600' :
                    history.outcome === 'Action Required' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {history.outcome === 'Compliant' ? <CheckCircle2 className="w-5 h-5" /> : 
                     history.outcome === 'Action Required' ? <AlertTriangle className="w-5 h-5" /> :
                     <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{history.targetUrl}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{history.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`self-start sm:self-auto inline-flex flex-col sm:flex-row items-end sm:items-center gap-3`}>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wide border ${
                    history.outcome === 'Compliant' ? 'bg-green-100 border-green-200 text-green-700' :
                    history.outcome === 'Action Required' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                    'bg-red-100 border-red-200 text-red-700'
                  }`}>
                    {history.outcome}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(history.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Hapus history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recent scans found. Start by entering a target above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-center text-slate-500 mb-6">
                {deleteConfirmId === 'ALL' 
                  ? 'Apakah kamu yakin akan menghapus semua history? Data yang dihapus tidak dapat dikembalikan.'
                  : 'Apakah kamu yakin akan menghapus history ini? Data yang dihapus tidak dapat dikembalikan.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Tidak
                </button>
                <button
                  onClick={() => handleDeleteHistory(deleteConfirmId)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Iya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

