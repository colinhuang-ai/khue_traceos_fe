import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TimelineView from "./components/TimelineView";
import ReportingView from "./components/ReportingView";
import EntryFormView from "./components/EntryFormView";
import KnowledgeBaseView from "./components/KnowledgeBaseView";
import { INITIAL_TRACES, INITIAL_KB } from "./data";
import { TraceEvent, TimelineLog, KnowledgeBaseArticle } from "./types";
import { Bell, ShieldAlert, Cpu, Heart, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [traces, setTraces] = useState<TraceEvent[]>(INITIAL_TRACES);
  const [selectedTraceId, setSelectedTraceId] = useState<string>("EVT-2024-8842");
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>(INITIAL_KB);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UTC clock tracker in header
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSystemTime(now.toUTCString().replace("GMT", "UTC"));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Find currently selected trace
  const activeTrace = traces.find(t => t.id === selectedTraceId) || traces[0];

  const handleSelectTrace = (traceId: string) => {
    setSelectedTraceId(traceId);
    setCurrentTab("timeline");
  };

  const handlePostNote = (traceId: string, log: TimelineLog) => {
    setTraces(prevTraces => prevTraces.map(t => {
      if (t.id === traceId) {
        return {
          ...t,
          logs: [...t.logs, log]
        };
      }
      return t;
    }));
    triggerToast(log.isAI ? "TraceBot diagnostic posted to trace logs!" : "SRE investigation comment appended successfully.");
  };

  const handleUpdateStatus = (traceId: string, status: 'Completed' | 'Investigating' | 'In Progress') => {
    setTraces(prevTraces => prevTraces.map(t => {
      if (t.id === traceId) {
        return {
          ...t,
          status
        };
      }
      return t;
    }));
    triggerToast(`Trace status updated to: ${status}`);
  };

  const handleCreateEvent = (eventData: Partial<TraceEvent>) => {
    const randomHex = Math.floor(Math.random() * 8999) + 1000;
    const newTrace: TraceEvent = {
      id: `TR-${randomHex}`,
      eventName: eventData.eventName || "Synthetic Trace Event",
      component: eventData.component || "us-east-1.production.auth",
      severity: eventData.severity || "INFO",
      assignedTo: eventData.assignedTo || "On-Call SRE",
      status: "Investigating",
      date: eventData.date || new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " UTC",
      metricsHeatmap: Array.from({ length: 16 }, () => Math.floor(Math.random() * 95) + 5),
      stages: [
        {
          name: "Ingress Gateway",
          status: "Pending Investigation",
          startPct: 5,
          durationPct: 35,
          color: "bg-brand-warning"
        },
        {
          name: eventData.component?.split(".").pop() || "Auth Cluster",
          status: "Awaiting Triage Diagnostics",
          startPct: 30,
          durationPct: 50,
          color: "bg-brand-secondary"
        }
      ],
      logs: [
        {
          id: `log-${Date.now()}`,
          author: "System Initiator",
          handle: "@telemetry",
          timestamp: "0s UTC",
          content: `Anomaly incident ledger logged manually. Initiating automatic telemetry tracing across virtual node ${eventData.component || "unknown"}.`
        }
      ]
    };

    setTraces(prev => [newTrace, ...prev]);
    setSelectedTraceId(newTrace.id);
    setCurrentTab("dashboard");
    triggerToast(`SRE trace logged successfully: ${newTrace.id} is now analyzing!`);
  };

  const handleCreateKB = (article: KnowledgeBaseArticle) => {
    setKbArticles(prev => [article, ...prev]);
    triggerToast(`Knowledge base post-mortem published: ${article.id}`);
  };

  // Switch content panel based on active navigation tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardView 
            traces={traces} 
            onSelectTrace={handleSelectTrace}
            onNavigateToNewEvent={() => setCurrentTab("entry-form")}
          />
        );
      case "timeline":
        return (
          <TimelineView 
            trace={activeTrace} 
            onPostNote={handlePostNote}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "reporting":
        return <ReportingView />;
      case "entry-form":
        return (
          <EntryFormView 
            onSubmitEvent={handleCreateEvent}
            recentTraces={traces}
          />
        );
      case "knowledge-base":
        return (
          <KnowledgeBaseView 
            articles={kbArticles} 
            onAddArticle={handleCreateKB}
          />
        );
      case "settings":
        return (
          <div className="p-6 bg-white border border-brand-highest rounded-lg max-w-2xl space-y-4">
            <h3 className="text-lg font-bold text-brand-on-surface">Settings Panel</h3>
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              Configure telemetry sampling rates, webhooks integration, PagerDuty schedules, and alert thresholds.
            </p>
            <div className="space-y-3 pt-3 text-xs leading-relaxed">
              <label className="flex items-center gap-3 font-semibold text-brand-on-surface">
                <input type="checkbox" defaultChecked className="rounded accent-brand-secondary h-4 w-4" />
                Enable real-time AI-assisted TraceBot diagnostics on failure cascades
              </label>
              <label className="flex items-center gap-3 font-semibold text-brand-on-surface">
                <input type="checkbox" defaultChecked className="rounded accent-brand-secondary h-4 w-4" />
                Integrate system-wide anomaly triggers with Slack workspace
              </label>
              <label className="flex items-center gap-3 font-semibold text-brand-on-surface">
                <input type="checkbox" className="rounded accent-brand-secondary h-4 w-4" />
                Synchronize metrics sampling (downscale to 30s) under peak latency loads
              </label>
            </div>
            <button 
              onClick={() => triggerToast("System-wide configuration settings synchronized.")}
              className="mt-4 px-4 py-2 bg-brand-primary hover:bg-opacity-95 text-xs text-white rounded font-bold"
            >
              Save Configuration
            </button>
          </div>
        );
      case "support":
        return (
          <div className="p-6 bg-white border border-brand-highest rounded-lg max-w-2xl space-y-4">
            <h3 className="text-lg font-bold text-brand-on-surface">Support & Operations</h3>
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              If telemetry endpoints degrade or database replications drop, contact the enterprise support center or review local container ingress streams.
            </p>
            <div className="p-4 bg-brand-low border rounded text-xs space-y-1">
              <p className="font-bold text-brand-on-surface">SRE Core On-Call Lead:</p>
              <p className="text-brand-on-surface-variant">Sarah Chen (@schendev) - Current rotation</p>
              <p className="text-brand-on-surface-variant mt-2">PagerDuty Target: <span className="font-mono bg-brand-container px-1 py-0.5 rounded text-[11px] font-bold">pd-us-east-triage</span></p>
            </div>
            <button
              onClick={() => alert("Operations alert dispatched to standby engineer.")}
              className="px-4 py-2 bg-brand-secondary text-white rounded text-xs font-bold"
            >
              Dispatch Crisis Alert
            </button>
          </div>
        );
      default:
        return <div className="text-xs">Select a workspace element from the navigation bar.</div>;
    }
  };

  return (
    <div id="traceos-app-frame" className="flex bg-brand-surface text-brand-on-surface min-h-screen">
      
      {/* Global Left Navigation Panel */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Primary Workspace Interface Viewport */}
      <main id="traceos-main-viewport" className="flex-1 flex flex-col min-w-0">
        
        {/* Unified Application Global Header */}
        <header className="h-16 border-b border-brand-highest bg-white sticky top-0 z-30 flex items-center justify-between px-8">
          
          {/* Header left: dynamic search & indicators */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-brand-success">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-ping"></span>
              99.98% Active uptime
            </span>
            <span className="text-brand-surface-dim">|</span>
            <span className="text-brand-on-surface-variant font-mono">
              System Time: <span id="system-time-display" className="text-brand-on-surface font-semibold">{systemTime || "Checking..."}</span>
            </span>
          </div>

          {/* Header right: indicators & profile settings */}
          <div className="flex items-center gap-3">
            
            {/* Interactive alert indicators */}
            <div className="flex bg-brand-low p-1.5 rounded border border-brand-highest text-xs gap-3">
              <div 
                title="Active investigation tunnels"
                className="flex items-center gap-1 text-brand-secondary cursor-pointer"
                onClick={() => handleSelectTrace("EVT-2024-8842")}
              >
                <Cpu className="h-4 w-4" />
                <span className="font-bold">Active Cascade</span>
              </div>
            </div>

            {/* Notifications icon */}
            <button 
              onClick={() => triggerToast("All telemetry channels stable. 0 sync errors queued.")}
              className="p-2 hover:bg-brand-low rounded-md relative text-[#76777d] hover:text-brand-on-surface transition-colors cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-error rounded-full"></span>
            </button>
          </div>

        </header>

        {/* Dynamic content scrollable viewport */}
        <div id="viewport-scroll-area" className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + (currentTab === "timeline" ? selectedTraceId : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Global Interactive Notification Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            id="global-system-toast"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1b1b1d] text-white text-xs font-semibold px-4 py-3 rounded-md shadow-lg border border-[#303032] flex items-center gap-2.5 max-w-md w-max"
          >
            <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
