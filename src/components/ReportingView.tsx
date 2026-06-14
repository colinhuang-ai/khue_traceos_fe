import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  FileDown, 
  RotateCw, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  MoreHorizontal,
  Search,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";
import { motion } from "motion/react";

export default function ReportingView() {
  const [selectedDept, setSelectedDept] = useState("All");
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(299); // 4:59
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(true);

  // Auto-refresh countdown simulated clock
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshSeconds((p) => (p > 0 ? p - 1 : 299));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    return `${mm}:${ss < 10 ? "0" : ""}${ss}`;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAutoRefreshSeconds(299);
    }, 800);
  };

  // KPI metadata
  const stats = [
    { label: "Total Trace Events", val: "1.24M", change: "+12.5%", color: "text-brand-success", isUp: true },
    { label: "Avg. Latency", val: "42ms", change: "-2.1%", color: "text-brand-success", isUp: false },
    { label: "Error Rate", val: "0.04%", change: "-18.4%", color: "text-brand-success", isUp: false },
    { label: "Dept Compliance", val: "99.2%", change: "Target Met", color: "text-brand-secondary", isUp: true }
  ];

  // Performance chart matching screenshot 2 (ENG, OPS, FIN, HR, MKT)
  const performanceData = [
    { dept: "ENG", current: 88, target: 95 },
    { dept: "OPS", current: 92, target: 90 },
    { dept: "FIN", current: 75, target: 85 },
    { dept: "HR",  current: 96, target: 95 },
    { dept: "MKT", current: 64, target: 80 }
  ];

  // Reports Summary table data matching mockup
  const reports = [
    { name: "Q3 Performance Audit", author: "Sarah Jenkins", dept: "Engineering", status: "Finalized", color: "text-brand-success bg-brand-success-container" },
    { name: "Latency Bottleneck Analysis", author: "Markus Thorne", dept: "Operations", status: "In Review", color: "text-brand-secondary bg-brand-secondary-light" },
    { name: "Security Vulnerability Sweep", author: "Alex Chen", dept: "Security", status: "Critical Action", color: "text-brand-error bg-brand-error-container" }
  ];

  return (
    <div id="reporting-view-container" className="space-y-6">
      
      {/* Upper Segment title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-on-surface font-sans">
            Reporting Center
          </h2>
          <p className="text-sm text-brand-on-surface-variant">
            Comprehensive analysis and departmental performance audit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mock export functionalities with animations */}
          <button 
            onClick={() => alert("Generating high-resolution PDF report...")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-brand-highest hover:bg-brand-low text-brand-on-surface text-xs font-semibold rounded-md transition-all cursor-pointer"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
          
          <button 
            onClick={() => alert("Formulating structured XLSX ledger export...")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-secondary text-white hover:bg-brand-secondary-hover text-xs font-semibold rounded-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filter Selection Panel */}
      <div className="p-4 bg-white border border-brand-highest rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-[10px] uppercase tracking-wider text-brand-on-surface-variant font-bold flex items-center gap-1">
            ⚡ Filters:
          </span>

          {/* Department filter dropdown pills */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-1.5 px-2 bg-brand-low border border-brand-highest rounded text-xs text-brand-on-surface focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="ENG">Engineering</option>
            <option value="OPS">Operations</option>
            <option value="FIN">Finance</option>
            <option value="HR">HR</option>
            <option value="MKT">Marketing</option>
          </select>

          {/* Static Last 30 days active filter indicator */}
          <span className="px-2.5 py-1.5 bg-brand-low border border-brand-highest rounded inline-flex items-center gap-1 text-brand-on-surface">
            Last 30 Days
          </span>

          {/* Status Active Dismissible filter tag */}
          {showStatusFilter && (
            <span className="px-2.5 py-1.5 bg-brand-secondary-light border border-[#ced4f9] rounded text-brand-secondary inline-flex items-center gap-1.5">
              Status: Active
              <button 
                onClick={() => setShowStatusFilter(false)} 
                className="hover:bg-[#dbdffc] p-0.5 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {/* Sync Countdown action */}
        <div className="flex items-center gap-2.5 text-brand-on-surface-variant text-xs">
          <span>Auto-refresh in <span className="font-mono font-bold text-brand-on-surface">{formatTime(autoRefreshSeconds)}</span></span>
          <button
            onClick={handleRefresh}
            className="p-1.5 border border-brand-highest rounded hover:bg-brand-low transition-colors"
          >
            <RotateCw className={`h-3.5 w-3.5 text-brand-on-surface ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Multi-block Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-5 bg-white border border-brand-highest rounded-lg flex flex-col justify-between">
            <p className="text-xs font-semibold text-brand-on-surface-variant uppercase tracking-wider">{stat.label}</p>
            <div className="flex justify-between items-end mt-4">
              <h3 className="text-3xl font-bold text-brand-on-surface tracking-tight font-sans">{stat.val}</h3>
              <span className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                stat.change.includes("-") ? "text-brand-success" : stat.change === "Target Met" ? "text-brand-secondary" : "text-brand-success"
              }`}>
                {stat.change.includes("-") ? <TrendingDown className="h-3 w-3" /> : stat.change.includes("+") ? <TrendingUp className="h-3 w-3" /> : null}
                {stat.change}
              </span>
            </div>
            
            {/* Elegant tiny color bar representing status progress */}
            <div className="h-1 bg-brand-low rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${idx === 2 ? "bg-brand-error" : "bg-brand-secondary"}`}
                style={{ width: idx === 0 ? "80%" : idx === 1 ? "45%" : idx === 2 ? "12%" : "99%" }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle comparative panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Performance Bar Comparison */}
        <div className="lg:col-span-2 p-6 bg-white border border-brand-highest rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-brand-on-surface">Department Performance</h3>
              <p className="text-xs text-brand-on-surface-variant">Comparative analysis of active vs target operational metrics</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-brand-secondary rounded-full"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-brand-surface-dim rounded-full"></span>
                <span>Target</span>
              </div>
            </div>
          </div>

          {/* SVG Comparative Bars rendering ENG, OPS, FIN, HR, MKT */}
          <div className="h-64 flex flex-col justify-between pt-2">
            {performanceData.map((d) => (
              <div key={d.dept} className="flex items-center gap-4">
                <span className="w-10 font-bold font-mono text-xs text-brand-on-surface">{d.dept}</span>
                
                {/* Horizontal dual bars */}
                <div className="flex-1 flex flex-col gap-1">
                  
                  {/* Current Active bar */}
                  <div className="w-full bg-brand-low h-3 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-brand-secondary h-full rounded-full transition-all duration-700" 
                      style={{ width: `${d.current}%` }}
                    ></div>
                    <span className="absolute right-2 top-0 text-[8px] font-mono font-bold text-brand-on-surface">{d.current}%</span>
                  </div>

                  {/* Target benchmark bar overlay line */}
                  <div className="w-full bg-brand-low h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-brand-surface-dim h-full rounded-full transition-all duration-700" 
                      style={{ width: `${d.target}%` }}
                    ></div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Allocation circle and lists */}
        <div className="p-6 bg-white border border-brand-highest rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-brand-on-surface">Resource Allocation</h3>
            <span className="text-xs text-brand-on-surface-variant">...</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            {/* Visual 84% Utilized ring */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eae7e9" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#4b41e1"
                  strokeWidth="3.5"
                  strokeDasharray="84 16"
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold font-sans">84%</span>
                <p className="text-[10px] text-brand-on-surface-variant uppercase font-bold tracking-wider">Utilized</p>
              </div>
            </div>

            {/* Compute, Storage, Network labels with lists alignment */}
            <div className="w-full mt-6 space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center py-1 border-b border-brand-low">
                <span className="flex items-center gap-1.5 text-brand-on-surface">
                  <span className="w-2 h-2 bg-brand-secondary rounded-full"></span>
                  Compute Capacity
                </span>
                <span className="font-mono text-brand-on-surface">42%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-brand-low">
                <span className="flex items-center gap-1.5 text-brand-on-surface">
                  <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                  Storage Nodes
                </span>
                <span className="font-mono text-brand-on-surface">28%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5 text-brand-on-surface">
                  <span className="w-2 h-2 bg-[#c3c0ff] rounded-full"></span>
                  Network Fabric
                </span>
                <span className="font-mono text-brand-on-surface">14%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Summary Reports Table */}
      <div id="summary-reports-table-panel" className="p-6 bg-white border border-brand-highest rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-brand-on-surface">Summary Reports</h3>
          <span className="text-xs text-[#76777d]">...</span>
        </div>

        <div className="overflow-x-auto border border-brand-highest rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-low text-brand-on-surface-variant uppercase text-[10px] font-bold border-b border-brand-container">
                <th className="p-3.5">Report Name</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Dept</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-container font-medium">
              {reports.map((rep, idx) => (
                <tr key={idx} className="hover:bg-brand-low/50 transition-colors">
                  <td className="p-3.5 font-semibold text-brand-on-surface text-xs">
                    {rep.name}
                  </td>
                  <td className="p-3.5 text-brand-on-surface">
                    {rep.author}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-brand-low text-brand-on-surface rounded font-mono text-[10px] font-semibold">
                      {rep.dept}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rep.color}`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button 
                      onClick={() => alert(`Reviewing action matrix ledger for ${rep.name}...`)}
                      className="p-1 hover:bg-brand-container rounded"
                    >
                      <MoreHorizontal className="h-4 w-4 text-brand-on-surface-variant" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
