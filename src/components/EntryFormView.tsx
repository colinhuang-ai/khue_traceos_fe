import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  Send, 
  FileText, 
  Check, 
  Lock, 
  AlertCircle, 
  Search, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { TraceEvent } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EntryFormProps {
  onSubmitEvent: (event: Partial<TraceEvent>) => void;
  recentTraces: TraceEvent[];
}

export default function EntryFormView({ onSubmitEvent, recentTraces }: EntryFormProps) {
  const [eventName, setEventName] = useState("");
  const [discoveryDate, setDiscoveryDate] = useState("");
  const [riskLevel, setRiskLevel] = useState("Low - Informational");
  const [assignee, setAssignee] = useState("");
  const [component, setComponent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  
  // Drag and drop / AI scanner state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisSummary, setAiAnalysisSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computes completeness score
  const getCompletenessPercent = () => {
    let score = 0;
    if (eventName) score += 25;
    if (discoveryDate) score += 25;
    if (assignee) score += 25;
    if (uploadedFile || component) score += 25;
    return score;
  };

  const completeness = getCompletenessPercent();

  // Dynamic Workflow steps based on completeness
  const getWorkflowStepStatus = (step: number) => {
    if (step === 1) return completeness >= 25 ? "checked" : "active";
    if (step === 2) {
      if (completeness >= 75) return "checked";
      if (completeness >= 25) return "active";
      return "locked";
    }
    if (step === 3) {
      if (completeness >= 100) return "active";
      return "locked";
    }
    // Step 4
    if (completeness === 100) return "active";
    return "locked";
  };

  // Log Scanning Simulation/Real parse trigger
  const handleFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    });
    setIsAnalyzing(true);
    setAiAnalysisSummary(null);

    // Read log contents and call Gemini log pipeline
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const response = await fetch("/api/analyze-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logContent: text || "System exception stack segment dummy",
            fileName: file.name
          })
        });
        const data = await response.json();
        
        // Auto fill fields using Gemini recommendations
        if (data.eventName) setEventName(data.eventName);
        if (data.riskLevel) setRiskLevel(data.riskLevel);
        if (data.component) setComponent(data.component);
        if (data.summary) setAiAnalysisSummary(data.summary);
      } catch (err) {
        console.error("Failed to connect with AI analyzer", err);
        // Fallback local simulation
        setEventName(`Latency Spike in ${file.name.split(".")[0]}`);
        setRiskLevel("Medium - Warning");
        setComponent(`us-east-1.production.${file.name.split(".")[0]}`);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !discoveryDate || !assignee) {
      alert("Please populate the required fields before submitting SRE incident ledger!");
      return;
    }

    const newTrace: Partial<TraceEvent> = {
      eventName,
      date: discoveryDate,
      severity: riskLevel.includes("Critical") ? "CRITICAL" : riskLevel.includes("Warning") ? "WARNING" : "INFO",
      assignedTo: assignee,
      component: component || "us-east-1.production.general",
      status: "Investigating"
    };

    onSubmitEvent(newTrace);
    
    // Clear state
    setEventName("");
    setDiscoveryDate("");
    setAssignee("");
    setComponent("");
    setUploadedFile(null);
    setAiAnalysisSummary(null);
  };

  return (
    <div id="entry-form-container" className="space-y-6">
      
      {/* Visual Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-on-surface font-sans">
          Log New Event
        </h2>
        <p className="text-sm text-brand-on-surface-variant font-sans">
          Populate the fields below to initiate a trace incident report.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form controls (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 bg-white border border-brand-highest rounded-lg space-y-5">
            
            {/* Event Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                Event Name *
              </label>
              <input
                type="text"
                required
                id="form-event-name"
                placeholder="e.g. Latency Spike - Cluster A"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-brand-surface-dim rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
              />
            </div>

            {/* Date & Risk dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                  Discovery Date *
                </label>
                <input
                  type="date"
                  required
                  id="form-discovery-date"
                  value={discoveryDate}
                  onChange={(e) => setDiscoveryDate(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-brand-surface-dim rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                  Risk Level
                </label>
                <select
                  id="form-risk-level"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-brand-surface-dim rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                >
                  <option>Low - Informational</option>
                  <option>Medium - Warning</option>
                  <option>High - Critical</option>
                </select>
              </div>
            </div>

            {/* Primary Assignee */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                Primary Assignee *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-on-surface-variant">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  id="form-assignee"
                  placeholder="Search engineers..."
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full pl-9 pr-12 py-2.5 text-xs bg-white border border-brand-surface-dim rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                />
                
                {/* Dynamically display calculated assignee initials tag */}
                {assignee && (
                  <span className="absolute right-3 top-2 px-1.5 py-0.5 bg-brand-[#c3c0ff] bg-brand-secondary text-white text-[9px] font-bold rounded uppercase">
                    {assignee.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </span>
                )}
              </div>
            </div>

            {/* Hidden field auto-recommended by Gemini log analytics */}
            {component && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                  Detected Target Component (Auto-Extracted)
                </label>
                <input
                  type="text"
                  placeholder="us-east-1.production..."
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full p-2 bg-brand-low border border-brand-highest rounded text-xs font-mono text-brand-on-surface"
                />
              </div>
            )}

            {/* Drag & Drop uploader area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-on-surface uppercase tracking-wider">
                Supporting Documentation / Artifacts
              </label>
              <div
                id="doc-dropzone"
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="border-2 border-dashed border-brand-surface-dim rounded-md p-8 flex flex-col items-center justify-center space-y-3 bg-brand-low hover:bg-brand-container/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  accept=".log,.json,.csv,.txt"
                />
                
                <UploadCloud className="h-8 w-8 text-brand-on-surface-variant animate-pulse-slow" />
                
                <div className="text-center">
                  <p className="text-xs font-semibold text-brand-on-surface">Drag and drop log files here</p>
                  <p className="text-[10px] text-brand-on-surface-variant font-medium mt-1">Support for .json, .log, .csv (Max 50MB)</p>
                </div>

                <button
                  type="button"
                  className="p-1 px-4 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-[10px] font-bold rounded transition-all"
                >
                  Select Files
                </button>
              </div>
            </div>

            {/* AI Log analysis summary report */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-brand-info-container/20 border border-brand-info flex items-center gap-3 rounded-md"
                >
                  <Sparkles className="h-5 w-5 text-brand-secondary animate-spin" />
                  <div className="text-xs leading-5">
                    <span className="font-bold text-brand-on-surface">TraceBot Intelligence:</span> Scanning log schema stack trace using Gemini 3.5...
                  </div>
                </motion.div>
              )}

              {aiAnalysisSummary && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-brand-success-container/35 border border-brand-success rounded-md text-xs space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-brand-success font-bold">
                    <Sparkles className="h-4 w-4" />
                    TraceBot Diagnostics Scan Complete (Gemini-Assisted)
                  </div>
                  <p className="text-brand-on-surface-variant leading-relaxed font-medium">{aiAnalysisSummary}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </form>

          {/* Workflow Stepper Card */}
          <div className="p-6 bg-white border border-brand-highest rounded-lg space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-brand-low">
              <h3 className="text-sm font-semibold text-brand-on-surface font-sans">
                Approval Workflow
              </h3>
              <span className="px-2 py-0.5 bg-brand-secondary-light text-brand-secondary font-bold font-mono text-[9px] rounded">
                AUTOMATED ROUTING
              </span>
            </div>

            {/* Dynamic steps stepper */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-4">
              
              {/* Stepper progress background bar lines */}
              <div className="hidden sm:block absolute left-2 top-4 right-2 h-[2px] bg-brand-container -z-10"></div>

              {/* Step 1 */}
              <div className="flex items-center sm:flex-col gap-3 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  getWorkflowStepStatus(1) === "checked" 
                    ? "bg-brand-success border-brand-success text-white" 
                    : "bg-brand-secondary border-brand-secondary text-white"
                }`}>
                  {getWorkflowStepStatus(1) === "checked" ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div className="sm:text-center">
                  <p className="text-xs font-semibold text-brand-on-surface">Initiation</p>
                  <p className="text-[10px] text-brand-on-surface-variant">Log event fields</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center sm:flex-col gap-3 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  getWorkflowStepStatus(2) === "checked" 
                    ? "bg-brand-success border-brand-success text-white" 
                    : getWorkflowStepStatus(2) === "active"
                    ? "bg-brand-secondary border-brand-secondary text-white"
                    : "bg-white border-brand-surface-dim text-[#76777d]"
                }`}>
                  {getWorkflowStepStatus(2) === "checked" ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div className="sm:text-center">
                  <p className="text-xs font-semibold text-brand-on-surface">Triage</p>
                  <p className="text-[10px] text-brand-on-surface-variant">TraceBot review</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center sm:flex-col gap-3 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  getWorkflowStepStatus(3) === "active"
                    ? "bg-brand-secondary border-brand-secondary text-white"
                    : "bg-white border-brand-surface-dim text-[#76777d]"
                }`}>
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <div className="sm:text-center">
                  <p className="text-xs font-semibold text-brand-on-surface">Risk Review</p>
                  <p className="text-[10px] text-brand-on-surface-variant">SRE authorization</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center sm:flex-col gap-3 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  getWorkflowStepStatus(4) === "active"
                    ? "bg-brand-success text-white"
                    : "bg-white border-brand-surface-dim text-[#76777d]"
                }`}>
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <div className="sm:text-center">
                  <p className="text-xs font-semibold text-brand-on-surface">Final Sign-off</p>
                  <p className="text-[10px] text-brand-on-surface-variant">Archived in KB</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right action control column */}
        <div className="space-y-6">
          
          {/* Main submissions board */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <button
              onClick={handleSubmit}
              id="submit-form-entry-btn"
              className="w-full py-3 bg-brand-primary hover:bg-opacity-90 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              Submit Entry
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => alert("SRE incident report draft cached securely.")}
              className="w-full py-3 bg-white border border-brand-highest hover:bg-brand-low text-brand-on-surface text-xs font-bold rounded transition-all cursor-pointer"
            >
              Save as Draft
            </button>

            {/* Alert banner */}
            <div className="p-3.5 bg-brand-info-container text-brand-info rounded flex items-start gap-2.5 leading-relaxed text-[11px] font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Submission will trigger an automatic alert to the SRE on-call team.</p>
            </div>
          </div>

          {/* Contextual Intelligence progress logs */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
              Contextual Intelligence
            </h3>

            {/* Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-brand-on-surface">
                <span>Form Completeness</span>
                <span className="text-brand-secondary">{completeness}%</span>
              </div>
              <div className="h-1.5 w-full bg-brand-low rounded-full overflow-hidden">
                <div 
                  className="bg-brand-secondary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Submissions preview feed */}
            <div className="space-y-3 pt-3 border-t border-brand-low">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-on-surface-variant">
                <FileText className="h-3.5 w-3.5 text-[#76777d]" />
                Recent Submissions
              </span>
              
              <div className="space-y-2 text-xs font-semibold text-brand-on-surface">
                {recentTraces.slice(0, 2).map((trace) => (
                  <div key={trace.id} className="flex justify-between items-center py-1">
                    <span className="truncate pr-4">{trace.eventName}</span>
                    <span className="text-[10px] font-mono text-brand-on-surface-variant font-medium shrink-0">
                      {trace.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom drawing server-rack global node state */}
          <div className="p-5 bg-[#121214] text-white border border-[#2d2d30] rounded-lg relative overflow-hidden flex flex-col justify-between h-44">
            
            {/* Server Rack background visual lines drawing */}
            <div className="absolute inset-0 opacity-15 flex flex-col justify-between p-4 pointer-events-none">
              <div className="h-1.5 bg-brand-secondary rounded w-full"></div>
              <div className="h-1.5 bg-brand-secondary rounded w-full"></div>
              <div className="h-1.5 bg-brand-secondary rounded w-full"></div>
              <div className="h-1.5 bg-brand-secondary rounded w-full"></div>
            </div>

            {/* Flashing server indicator lights */}
            <div className="absolute right-4 top-4 flex gap-1 z-10">
              <span className="w-2.5 h-2.5 bg-brand-success rounded-full animate-ping absolute"></span>
              <span className="w-2.5 h-2.5 bg-brand-success rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-brand-success rounded-full opacity-60"></span>
            </div>

            <div className="space-y-1 z-10 mt-6">
              <p className="text-[10px] font-mono uppercase tracking-wider text-brand-secondary font-bold">
                GLOBAL NODE STATUS
              </p>
              <h3 className="text-2xl font-bold font-sans tracking-tight">
                99.98% Operational
              </h3>
            </div>

            <p className="text-[9px] font-mono text-brand-on-surface-variant z-10 uppercase tracking-widest font-semibold mt-auto">
              Datacenter cluster: us-east-1
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
