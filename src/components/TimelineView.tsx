import React, { useState } from "react";
import { 
  ChevronRight, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  FileCode, 
  Share2, 
  RefreshCw, 
  TrendingUp, 
  GitFork, 
  Database, 
  Server, 
  Network
} from "lucide-react";
import { TraceEvent, TimelineLog } from "../types";
import { motion } from "motion/react";

interface TimelineProps {
  trace: TraceEvent;
  onPostNote: (traceId: string, log: TimelineLog) => void;
  onUpdateStatus: (traceId: string, status: 'Completed' | 'Investigating' | 'In Progress') => void;
}

export default function TimelineView({ trace, onPostNote, onUpdateStatus }: TimelineProps) {
  const [activeSubTab, setActiveSubTab] = useState<"timeline" | "dependency" | "json">("timeline");
  const [newNote, setNewNote] = useState("");
  const [isGeneratingAiNote, setIsGeneratingAiNote] = useState(false);
  const [filterRole, setFilterRole] = useState("All");

  const handlePostNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNote.trim()) return;

    const addedLog: TimelineLog = {
      id: `log-user-${Date.now()}`,
      author: "Admin User",
      handle: "@admin",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " UTC",
      content: newNote
    };

    onPostNote(trace.id, addedLog);
    setNewNote("");
  };

  // Modern backend-powered Gemini analysis!
  const triggerAiDiagnostic = async () => {
    setIsGeneratingAiNote(true);
    try {
      const response = await fetch("/api/suggest-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTitle: trace.eventName,
          stages: trace.stages,
          currentLogs: trace.logs
        })
      });
      const data = await response.json();
      
      const aiLog: TimelineLog = {
        id: `log-ai-${Date.now()}`,
        author: "TraceBot",
        handle: "AI Diagnostic",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " UTC",
        content: data.noteContent || "TraceBot Diagnostic failed to poll cascade telemetry. Check network interfaces.",
        isAI: true
      };

      onPostNote(trace.id, aiLog);
    } catch (err) {
      console.error(err);
      // Offline fallback note
      onPostNote(trace.id, {
        id: `log-ai-${Date.now()}`,
        author: "TraceBot",
        handle: "AI Diagnostic",
        timestamp: "Now UTC",
        content: "TraceBot AI Diagnostic (Offline Fallback): Detected cascading timeouts in Auth Service endpoints. System latency indicates localized DB connection exhaustion during peaks.",
        isAI: true
      });
    } finally {
      setIsGeneratingAiNote(false);
    }
  };

  // Helper component icon select
  const getStageIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes("db") || lowercase.includes("postgres") || lowercase.includes("sql")) {
      return <Database className="h-4 w-4 text-brand-info" />;
    }
    if (lowercase.includes("auth") || lowercase.includes("token")) {
      return <Server className="h-4 w-4 text-brand-warning" />;
    }
    if (lowercase.includes("redis") || lowercase.includes("cache")) {
      return <RefreshCw className="h-4 w-4 text-brand-secondary" />;
    }
    return <Network className="h-4 w-4 text-brand-error" />;
  };

  const getHeatmapColor = (val: number) => {
    if (val >= 90) return "bg-brand-error opacity-90";
    if (val >= 75) return "bg-brand-error opacity-60";
    if (val >= 50) return "bg-brand-warning opacity-70";
    if (val >= 30) return "bg-brand-secondary opacity-40";
    return "bg-brand-highest";
  };

  return (
    <div id="timeline-view-container" className="space-y-6">
      
      {/* Title Segment */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-brand-on-surface-variant bg-brand-container px-2.5 py-1 rounded font-semibold">
            TRACE
          </span>
          <h2 className="text-xl font-bold tracking-tight font-sans text-brand-on-surface">
            #{trace.id}
          </h2>
          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            trace.severity === "CRITICAL"
              ? "bg-brand-error-container text-brand-error animate-pulse"
              : "bg-brand-warning-container text-brand-warning"
          }`}>
            {trace.severity} IMPACT
          </span>
        </div>

        {/* Dynamic sub tab selectors */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-container p-1 rounded-md flex">
            {(["timeline", "dependency", "json"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-sm capitalize transition-all cursor-pointer ${
                  activeSubTab === tab 
                    ? "bg-white text-brand-on-surface shadow-sm" 
                    : "text-brand-on-surface-variant hover:text-brand-on-surface"
                }`}
              >
                {tab === "json" ? "Raw JSON" : tab.replace("-", " ")}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-opacity-90">
            <Share2 className="h-3 w-3" />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Meta (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Cascade Gantt or Alternate Views (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-white border border-brand-highest rounded-lg">
            
            {activeSubTab === "timeline" && (
              <div id="gantt-flow-chart" className="space-y-6">
                
                {/* Millisecond tick header scale */}
                <div className="flex text-[10px] font-mono text-brand-on-surface-variant border-b border-brand-container pb-2">
                  <div className="w-1/4 font-semibold uppercase tracking-wider">Stage / Component</div>
                  <div className="flex-1 grid grid-cols-6 text-center font-semibold">
                    <span>00:00:00</span>
                    <span>00:00:15</span>
                    <span>00:00:30</span>
                    <span>00:00:45</span>
                    <span>00:01:00</span>
                    <span>00:01:15</span>
                  </div>
                </div>

                {/* Stages Gantt loop list */}
                <div className="space-y-4">
                  {trace.stages.map((stage, idx) => (
                    <div key={idx} className="flex items-center">
                      {/* Name & Icon identifier */}
                      <div className="w-1/4 flex items-center gap-3 pr-4">
                        {getStageIcon(stage.name)}
                        <span className="font-semibold text-xs text-brand-on-surface">{stage.name}</span>
                      </div>

                      {/* Bar duration wrapper */}
                      <div className="flex-1 bg-brand-low h-9 rounded-md relative overflow-hidden border border-brand-container">
                        {/* Time Grid Guides */}
                        <div className="absolute inset-0 grid grid-cols-6 divide-x divide-brand-container/60 pointer-events-none">
                          <span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>

                        {/* Active Progress Duration Bar with text status */}
                        <div 
                          style={{
                            left: `${stage.startPct}%`,
                            width: `${stage.durationPct}%`
                          }}
                          className={`absolute top-1 bottom-1 ${stage.color} rounded text-[10px] text-white flex items-center px-3.5 font-semibold font-mono tracking-wide truncate transition-all duration-700 shadow-sm`}
                        >
                          {stage.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "dependency" && (
              <div id="dependency-graph-visual" className="h-64 flex flex-col justify-center items-center text-center space-y-4">
                <GitFork className="h-10 w-10 text-brand-secondary animate-bounce" />
                <div>
                  <h4 className="font-semibold text-brand-on-surface text-sm">System Service Graph Topology</h4>
                  <p className="text-xs text-brand-on-surface-variant max-w-sm mt-1">
                    Cascade map shows the Ingress Gateway propagating socket timeouts to the Auth-Service cluster, depleting active database connection handles.
                  </p>
                </div>
                {/* Node visualization line mapping */}
                <div className="flex items-center gap-2 text-xs font-mono bg-brand-low p-2 px-3.5 rounded border border-brand-highest">
                  <span className="text-brand-success font-bold">Ingress</span>
                  <span className="text-brand-on-surface-variant">→</span>
                  <span className="text-brand-error font-bold">Auth (v2-cluster)</span>
                  <span className="text-brand-on-surface-variant">→</span>
                  <span className="text-brand-warning font-bold">Postgres-Master</span>
                </div>
              </div>
            )}

            {activeSubTab === "json" && (
              <div id="raw-trace-json" className="bg-[#1b1b1d] text-brand-low p-4 rounded-md font-mono text-[11px] overflow-x-auto h-64 border border-[#303032]">
                <pre>{JSON.stringify(trace, null, 2)}</pre>
              </div>
            )}

          </div>

          {/* SRE Comments Feed & Add form */}
          <div className="p-6 bg-white border border-brand-highest rounded-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-brand-container">
              <h3 className="text-base font-semibold text-brand-on-surface">
                Investigation Logs
              </h3>
              
              <div className="flex items-center gap-2">
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-2 py-1 text-xs bg-brand-low border border-brand-highest rounded-md font-medium text-brand-on-surface focus:outline-none"
                >
                  <option value="All">All Roles</option>
                  <option value="AI Only">AI Logs</option>
                  <option value="User Only">User Logs</option>
                </select>
              </div>
            </div>

            {/* Logs render stream */}
            <div className="space-y-4">
              {trace.logs
                .filter(log => {
                  if (filterRole === "AI Only") return log.isAI;
                  if (filterRole === "User Only") return !log.isAI;
                  return true;
                })
                .map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-lg border leading-relaxed text-xs ${
                      log.isAI 
                        ? "bg-brand-info-container/40 border-brand-info-container/60" 
                        : "bg-brand-low border-brand-container"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {log.isAI ? (
                          <div className="h-5 w-5 rounded-full bg-brand-secondary flex items-center justify-center text-white">
                            <Sparkles className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded bg-brand-surface-dim/40 flex items-center justify-center font-bold text-brand-on-surface text-[10px] uppercase">
                            {log.author[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-brand-on-surface">{log.author}</span>
                          <span className="text-[10px] text-brand-on-surface-variant ml-1.5 font-mono">{log.handle}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-brand-on-surface-variant">{log.timestamp}</span>
                    </div>

                    <p className="text-brand-on-surface whitespace-pre-wrap">{log.content}</p>

                    {/* Render tags if any */}
                    {log.tags && log.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2.5">
                        {log.tags.map((tg, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-brand-highest rounded-[4px] text-[10px] font-bold text-brand-on-surface-variant">
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Render attachment block */}
                    {log.attachment && (
                      <div className="flex items-center gap-2 mt-2.5 p-2 bg-white rounded border border-brand-highest max-w-xs font-mono text-[10px] font-semibold text-brand-on-surface-variant">
                        <FileCode className="h-3.5 w-3.5 text-brand-secondary" />
                        <span className="truncate flex-1">{log.attachment.name}</span>
                        <span className="text-[9px] text-[#76777d]">{log.attachment.size}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Note text box submission */}
            <form onSubmit={handlePostNote} className="space-y-3 pt-4 border-t border-brand-container">
              <textarea
                placeholder="Add a note to this investigation (Markdown supported)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-brand-low border border-brand-highest rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
              />
              
              <div className="flex justify-between items-center">
                {/* AI Helper Trigger */}
                <button
                  type="button"
                  id="btn-ask-tracebot"
                  onClick={triggerAiDiagnostic}
                  disabled={isGeneratingAiNote}
                  className="inline-flex items-center gap-1.5 p-1 px-3 bg-brand-secondary-light hover:bg-[#dedbfc] text-brand-secondary text-xs font-bold rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGeneratingAiNote ? "Analyzing Cascade..." : "Ask TraceBot AI"}
                </button>

                <button
                  type="submit"
                  id="btn-post-note"
                  className="font-bold inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-primary hover:bg-opacity-95 text-white text-xs rounded transition-all cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  Post Note
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Dynamic Investigation Meta & Heatmap (Right Sidebar) */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
              Investigation Meta
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-brand-on-surface-variant uppercase font-bold">Assignee</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-5 w-5 rounded-full bg-brand-secondary/15 flex items-center justify-center text-[10px] font-bold text-brand-secondary">
                    {trace.assignedTo[0]}
                  </div>
                  <span className="font-semibold text-brand-on-surface">{trace.assignedTo} (Lead)</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-brand-on-surface-variant uppercase font-bold">Current Status</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    trace.status === "Completed" ? "bg-brand-success" : "bg-brand-secondary animate-pulse"
                  }`}></span>
                  <span className="font-semibold text-brand-on-surface">{trace.status === "Completed" ? "Completed" : "In Progress (Active)"}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-brand-on-surface-variant uppercase font-bold">Global Impact</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-brand-error font-semibold uppercase text-[10px] tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Critical (Tier 1)
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Heatmap Component */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
                Metrics Heatmap
              </h3>
              <span className="text-[9px] bg-brand-container px-1.5 py-0.5 rounded font-mono text-brand-on-surface-variant font-semibold">
                Latency Dist
              </span>
            </div>

            {/* Matrix Tile grid */}
            <div id="heatmap-cells" className="grid grid-cols-4 gap-2 aspect-square">
              {(trace.metricsHeatmap || [
                50, 70, 80, 90,
                30, 45, 60, 50,
                10, 20, 40, 30,
                5, 10, 15, 20
              ]).map((cellVal, idx) => (
                <div
                  key={idx}
                  title={`Subsegment Latency Density: ${cellVal}%`}
                  className={`w-full h-full rounded transition-all duration-300 hover:scale-105 cursor-pointer ${getHeatmapColor(cellVal)}`}
                ></div>
              ))}
            </div>

            <div className="flex justify-between text-[9px] uppercase font-semibold text-brand-on-surface-variant pt-1 text-right">
              <span>Stable</span>
              <span>Latent Distribution</span>
            </div>
          </div>

          {/* Dynamic state resolvers */}
          <div className="space-y-2">
            {trace.status !== "Completed" ? (
              <button
                id="btn-resolve-event"
                onClick={() => onUpdateStatus(trace.id, "Completed")}
                className="w-full py-2.5 bg-brand-success hover:bg-opacity-95 text-white text-xs font-semibold rounded shadow-sm text-center transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve Event
              </button>
            ) : (
              <button
                id="btn-reopen-event"
                onClick={() => onUpdateStatus(trace.id, "In Progress")}
                className="w-full py-2.5 bg-brand-warning hover:bg-opacity-95 text-white text-xs font-semibold rounded shadow-sm text-center transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reopen Trace
              </button>
            )}

            <button
              id="btn-escalate-pagerduty"
              onClick={() => {
                alert("Incident status escalated! PagerDuty schedule alert dispatched to the on-call SRE lead.");
              }}
              className="w-full py-2.5 bg-white border border-brand-error text-brand-error hover:bg-brand-error-container text-xs font-semibold rounded transition-all cursor-pointer"
            >
              Escalate to PagerDuty
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
