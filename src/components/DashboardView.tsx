import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink
} from "lucide-react";
import { TraceEvent } from "../types";
import { motion } from "motion/react";

interface DashboardProps {
  traces: TraceEvent[];
  onSelectTrace: (traceId: string) => void;
  onNavigateToNewEvent: () => void;
}

export default function DashboardView({ traces, onSelectTrace, onNavigateToNewEvent }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filter traces based on search term
  const filteredTraces = traces.filter(trace => 
    trace.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trace.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trace.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trace.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute pagination
  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);
  const displayedTraces = filteredTraces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const activeCount = traces.filter(t => t.status === "Investigating" || t.status === "In Progress").length;
  const criticalCount = traces.filter(t => t.severity === "CRITICAL").length;

  // Monthly trend mock series data
  const trendData = [
    { month: "Jan", count: 240, active: false },
    { month: "Feb", count: 310, active: false },
    { month: "Mar", count: 280, active: false },
    { month: "Apr", count: 420, active: false },
    { month: "May", count: 390, active: false },
    { month: "Jun", count: 520, active: false },
    { month: "Jul", count: 680, active: true }, // Highlighted active month from screenshot
    { month: "Aug", count: 480, active: false },
    { month: "Sep", count: 450, active: false },
    { month: "Oct", count: 320, active: false },
    { month: "Nov", count: 410, active: false },
    { month: "Dec", count: 380, active: false },
  ];

  const maxTrendValue = Math.max(...trendData.map(d => d.count));

  return (
    <div id="dashboard-view-content" className="space-y-6">
      
      {/* Upper Title and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-on-surface font-sans">
            System Overview
          </h2>
          <p className="text-sm text-brand-on-surface-variant font-sans">
            Real-time observability and live event tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            id="time-range-select"
            className="px-3.5 py-2 text-sm bg-white border border-brand-surface-dim rounded-md font-medium text-brand-on-surface focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All-Time History</option>
          </select>
          <button
            id="btn-trigger-new-event"
            onClick={onNavigateToNewEvent}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-medium text-sm rounded-md hover:bg-opacity-90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </div>

      {/* KPI Top-Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div id="kpi-total-events" className="p-5 bg-white rounded-lg border border-brand-highest flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant">
              Total Events
            </p>
            <h3 className="text-3xl font-bold font-sans">12,842</h3>
            <span className="inline-flex items-center text-xs font-semibold text-brand-success">
              +12% this month
            </span>
          </div>
          <div className="p-2.5 bg-brand-success-container rounded-md">
            <Activity className="h-5 w-5 text-brand-success" />
          </div>
        </div>

        {/* Active Events */}
        <div id="kpi-active-events" className="p-5 bg-white rounded-lg border border-brand-highest flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant">
              Active Events
            </p>
            <h3 className="text-3xl font-bold font-sans">{activeCount + 44}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-warning-container text-brand-warning">
              High Flow
            </span>
          </div>
          <div className="p-2.5 bg-brand-warning-container rounded-md">
            <Clock className="h-5 w-5 text-brand-warning" />
          </div>
        </div>

        {/* Closed Events */}
        <div id="kpi-closed-events" className="p-5 bg-white rounded-lg border border-brand-highest flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant">
              Closed
            </p>
            <h3 className="text-3xl font-bold font-sans">11,401</h3>
            <span className="inline-flex items-center text-xs font-semibold text-brand-on-surface-variant">
              98% Res Rate
            </span>
          </div>
          <div className="p-2.5 bg-brand-info-container rounded-md">
            <CheckCircle2 className="h-5 w-5 text-brand-info" />
          </div>
        </div>

        {/* High Severity Events */}
        <div id="kpi-high-severity" className="p-5 bg-white rounded-lg border border-brand-highest border-l-4 border-l-brand-error flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-on-surface-variant">
              High Severity
            </p>
            <h3 className="text-3xl font-bold text-brand-error font-sans">{criticalCount + 5}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-error-container text-brand-error">
              Action Req
            </span>
          </div>
          <div className="p-2.5 bg-brand-error-container rounded-md">
            <AlertOctagon className="h-5 w-5 text-brand-error" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Event Trend Custom Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-brand-highest rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-brand-on-surface">Monthly Event Trend</h3>
              <p className="text-xs text-brand-on-surface-variant">System trigger trends across current year</p>
            </div>
            <div className="text-xs text-brand-on-surface-variant">...</div>
          </div>

          {/* Render Bars Custom Render */}
          <div className="h-56 flex items-end gap-2.5 pt-6 pb-2">
            {trendData.map((d) => {
              const heightPct = (d.count / maxTrendValue) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                  {/* Hover value indicator */}
                  <div className="opacity-0 group-hover:opacity-100 bg-brand-primary text-white text-[10px] px-1.5 py-1 rounded absolute -translate-y-14 transition-all z-10 font-bold">
                    {d.count}
                  </div>
                  
                  {/* The bar element */}
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      d.active 
                        ? "bg-brand-secondary" 
                        : "bg-brand-secondary/35 group-hover:bg-brand-secondary/60"
                    }`}
                  ></div>
                  <span className="mt-2 text-[10px] uppercase font-semibold text-brand-on-surface-variant">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution Circle Widget */}
        <div className="p-6 bg-white border border-brand-highest rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-brand-on-surface">Severity Distribution</h3>
            <span className="text-xs text-brand-on-surface-variant">...</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative h-32 w-32 flex items-center justify-center">
              {/* Custom SVG Circular Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#eae7e9"
                  strokeWidth="3.5"
                />
                {/* Low: 70%, Stroke offset starts at 0 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#4b41e1"
                  strokeWidth="3.5"
                  strokeDasharray="70 30"
                  strokeDashoffset="0"
                />
                {/* Medium: 20%, Stroke offset starts at 70 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3.5"
                  strokeDasharray="20 80"
                  strokeDashoffset="-70"
                />
                {/* Critical: 10%, Stroke offset starts at 90 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ba1a1a"
                  strokeWidth="3.5"
                  strokeDasharray="10 90"
                  strokeDashoffset="-90"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold font-sans">100%</span>
                <p className="text-[10px] uppercase text-brand-on-surface-variant tracking-wider font-semibold">Coverage</p>
              </div>
            </div>

            <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className="p-1">
                <div className="inline-block w-2.5 h-2.5 rounded-full bg-brand-secondary mr-1.5 align-middle"></div>
                <span className="text-brand-on-surface">70% Low</span>
              </div>
              <div className="p-1">
                <div className="inline-block w-2.5 h-2.5 rounded-full bg-brand-warning mr-1.5 align-middle"></div>
                <span className="text-brand-on-surface">20% Med</span>
              </div>
              <div className="p-1">
                <div className="inline-block w-2.5 h-2.5 rounded-full bg-brand-error mr-1.5 align-middle"></div>
                <span className="text-brand-on-surface">10% Crit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recents Trace List */}
      <div className="p-6 bg-white border border-brand-highest rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h3 className="text-base font-semibold text-brand-on-surface">
            Recent Trace Events
          </h3>
          
          {/* Internal search filter bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-on-surface-variant">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              id="trace-search-bar"
              placeholder="Search trace ID or element..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-brand-low border border-brand-highest rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
            />
          </div>
        </div>

        {/* Traces Table */}
        <div className="overflow-x-auto border border-brand-highest rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-low text-brand-on-surface-variant uppercase text-[10px] font-bold border-b border-brand-container">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Event Name</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-container font-medium">
              {displayedTraces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-on-surface-variant">
                    No tracing records matching current query parameters.
                  </td>
                </tr>
              ) : (
                displayedTraces.map((trace) => {
                  return (
                    <tr 
                      key={trace.id}
                      onClick={() => onSelectTrace(trace.id)}
                      className="hover:bg-brand-low/55 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 font-mono text-brand-on-surface font-semibold">
                        {trace.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-brand-on-surface">{trace.eventName}</div>
                        <div className="text-[10px] text-brand-on-surface-variant font-mono">{trace.component}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          trace.severity === "CRITICAL" 
                            ? "bg-brand-error-container text-brand-error" 
                            : trace.severity === "WARNING"
                            ? "bg-brand-warning-container text-brand-warning"
                            : "bg-brand-info-container text-brand-info"
                        }`}>
                          {trace.severity}
                        </span>
                      </td>
                      <td className="p-3.5 flex items-center gap-2 pt-5">
                        <div className="h-5 w-5 rounded-full bg-brand-surface-dim/40 flex items-center justify-center text-[9px] font-bold text-brand-on-surface uppercase">
                          {trace.assignedTo.split(" ").map(w => w[0]).join("")}
                        </div>
                        <span className="text-brand-on-surface">{trace.assignedTo}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="flex items-center gap-1.5 text-brand-on-surface">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            trace.status === "Completed" 
                              ? "bg-brand-success" 
                              : trace.status === "Investigating"
                              ? "bg-brand-error"
                              : trace.status === "In Progress"
                              ? "bg-brand-secondary"
                              : "bg-brand-warning"
                          }`}></span>
                          {trace.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="p-1 px-2.5 bg-brand-surface border border-brand-highest rounded hover:bg-brand-low inline-flex items-center gap-1 group-hover:border-brand-secondary transition-all">
                          <ExternalLink className="h-3 w-3 text-brand-on-surface-variant group-hover:text-brand-secondary" />
                          <span className="text-[10px] text-brand-on-surface-variant group-hover:text-brand-secondary font-semibold">Track</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginator */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-brand-on-surface-variant font-medium">
              Showing {displayedTraces.length} of {filteredTraces.length} trace records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1 border border-brand-highest rounded-md hover:bg-brand-low disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currentPage === i + 1 
                      ? "bg-brand-secondary text-white" 
                      : "border border-brand-highest hover:bg-brand-low text-brand-on-surface"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-1 border border-brand-highest rounded-md hover:bg-brand-low disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
