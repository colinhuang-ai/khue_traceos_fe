import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  AlertCircle,
  FileText,
  Tag,
  ThumbsUp,
  X
} from "lucide-react";
import { KnowledgeBaseArticle } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface KnowledgeBaseProps {
  articles: KnowledgeBaseArticle[];
  onAddArticle: (article: KnowledgeBaseArticle) => void;
}

export default function KnowledgeBaseView({ articles, onAddArticle }: KnowledgeBaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // New Article creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newSolution, setNewSolution] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const [newSeverity, setNewSeverity] = useState<"CRITICAL" | "WARNING" | "INFO">("CRITICAL");
  const [newTagsString, setNewTagsString] = useState("");

  // Refining checkboxes state matching Screenshot 3
  const [filterCritical, setFilterCritical] = useState(true);
  const [filterWarning, setFilterWarning] = useState(true);
  const [filterInfo, setFilterInfo] = useState(true);

  const categories = ["All", "Lessons Learned", "History", "Guidelines", "Architecture Docs"];

  // Filter logic
  const filteredArticles = articles.filter(art => {
    // Search terms matches titles or tags or solution
    const matchesSearch = 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Severity checkboxes match
    const matchesSeverity = 
      (art.severity === "CRITICAL" && filterCritical) ||
      (art.severity === "WARNING" && filterWarning) ||
      (art.severity === "INFO" && filterInfo);

    // Categories filter simulation
    const matchesCategory = activeCategory === "All" || 
      (activeCategory === "Lessons Learned" && art.tags.includes("SRE")) ||
      (activeCategory === "Guidelines" && art.tags.includes("Architecture")) ||
      (activeCategory === "History" && art.id.includes("KB")) ||
      (activeCategory === "Architecture Docs" && art.tags.includes("Database"));

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const displayedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newSolution.trim()) {
      alert("Please fill in high priority documentation segments!");
      return;
    }

    const tagsArr = newTagsString ? newTagsString.split(",").map(s => s.trim()) : ["General"];
    const added: KnowledgeBaseArticle = {
      id: `KB-${Math.floor(Math.random() * 900) + 1000}`,
      title: newTitle,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      severity: newSeverity,
      summary: newSummary,
      solution: newSolution,
      outcome: newOutcome || "System reverted to baseline metrics successfully.",
      tags: tagsArr
    };

    onAddArticle(added);
    
    // Clear State & Close
    setIsModalOpen(false);
    setNewTitle("");
    setNewSummary("");
    setNewSolution("");
    setNewOutcome("");
    setNewSeverity("CRITICAL");
    setNewTagsString("");
  };

  return (
    <div id="kb-view-container" className="space-y-6">
      
      {/* Upper Segment title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-on-surface font-sans">
            Knowledge Base
          </h2>
          <p className="text-sm text-brand-on-surface-variant font-sans">
            Centralized technical wisdom, documented post-mortems, and historical event patterns.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-trigger-new-kb"
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-medium text-sm rounded-md hover:bg-opacity-95 transition-all cursor-pointer shadow-sm self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left main content (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-white border border-brand-highest rounded-lg space-y-4">
            
            {/* Search Input bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#76777d]">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                id="kb-search-bar"
                placeholder="Search solutions, tags, database incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-brand-low border border-brand-highest rounded-md text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary/70"
              />
            </div>

            {/* Nav Categories filtering rail */}
            <div className="flex flex-wrap gap-1.5 border-b border-brand-low pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded font-medium transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#303032] text-white"
                      : "text-[#76777d] hover:bg-brand-low hover:text-brand-on-surface"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles list */}
            <div className="space-y-6 pt-2">
              {displayedArticles.length === 0 ? (
                <div className="text-center p-12 py-16 text-brand-on-surface-variant font-sans">
                  <BookOpen className="h-8 w-8 mx-auto text-brand-surface-dim mb-3" />
                  <p className="text-xs font-semibold">No Knowledge Base articles matching your current query.</p>
                  <p className="text-[10px] mt-1">Try toggling severity filters or refinement categories.</p>
                </div>
              ) : (
                displayedArticles.map((art) => (
                  <div key={art.id} className="p-5 border border-brand-highest rounded-lg space-y-4 hover:shadow-sm transition-shadow">
                    
                    {/* Upper title context */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] font-bold text-brand-secondary bg-brand-secondary-light px-2 py-0.5 rounded uppercase">
                          {art.id}
                        </span>
                        <h3 className="text-base font-bold text-brand-on-surface">{art.title}</h3>
                        <p className="text-[10px] text-brand-on-surface-variant font-semibold">Published: {art.date}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        art.severity === "CRITICAL"
                          ? "bg-brand-error-container text-brand-error"
                          : art.severity === "WARNING"
                          ? "bg-brand-warning-container text-brand-warning"
                          : "bg-brand-info-container text-brand-info"
                      }`}>
                        {art.severity}
                      </span>
                    </div>

                    {/* Content breakdown */}
                    <div className="space-y-3 pt-2 border-t border-brand-low text-xs leading-relaxed">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-brand-on-surface-variant">The Summary</p>
                        <p className="text-brand-on-surface mt-0.5 font-medium">{art.summary}</p>
                      </div>

                      <div className="p-3 bg-brand-low rounded border border-brand-highest border-l-4 border-l-brand-secondary">
                        <p className="text-[10px] font-bold uppercase text-brand-secondary">Documented Resolution</p>
                        <p className="text-brand-on-surface mt-1 font-semibold">{art.solution}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#15803d]">Historical Outcome</p>
                        <p className="text-brand-on-surface mt-0.5 font-medium">{art.outcome}</p>
                      </div>
                    </div>

                    {/* Tags footer section */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-brand-low">
                      <div className="flex gap-1.5 flex-wrap">
                        {art.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-brand-low border border-brand-highest rounded text-[10px] text-brand-on-surface-variant font-bold flex items-center gap-1">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => alert(`Upvoted Resolution ${art.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-brand-highest rounded-md text-[#76777d] hover:text-brand-on-surface hover:bg-brand-low transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Helpful Resolution
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Pagination components */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-brand-low">
                <span className="text-xs text-brand-on-surface-variant">
                  Showing {displayedArticles.length} of {filteredArticles.length} entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="p-1 border border-brand-highest rounded hover:bg-brand-low disabled:opacity-45"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-brand-on-surface px-2">Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="p-1 border border-brand-highest rounded hover:bg-brand-low disabled:opacity-45"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right refine & stats side-panel (1 column) */}
        <div className="space-y-6">
          
          {/* Refine Knowledge Checklist */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
              Refine Knowledge
            </h3>

            {/* Severity Checkboxes */}
            <div className="space-y-2.5 text-xs font-semibold text-brand-on-surface">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterCritical}
                  onChange={(e) => setFilterCritical(e.target.checked)}
                  className="rounded text-brand-secondary focus:ring-brand-secondary h-4 w-4 accent-brand-secondary"
                />
                Critical Outage
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterWarning}
                  onChange={(e) => setFilterWarning(e.target.checked)}
                  className="rounded text-brand-secondary focus:ring-brand-secondary h-4 w-4 accent-brand-secondary"
                />
                System Degraded
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterInfo}
                  onChange={(e) => setFilterInfo(e.target.checked)}
                  className="rounded text-brand-secondary focus:ring-brand-secondary h-4 w-4 accent-brand-secondary"
                />
                Informational Rules
              </label>
            </div>
          </div>

          {/* TraceOS Insight Stats */}
          <div className="p-5 bg-white border border-brand-highest rounded-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
              TraceOS Insight
            </h3>

            {/* Smart stats prompt bubble */}
            <div className="p-3 bg-brand-success-container/30 border border-brand-success text-brand-on-surface rounded text-xs gap-2 flex leading-relaxed font-semibold">
              <Sparkles className="h-5 w-5 text-brand-success shrink-0 mt-0.5" />
              <p>92% of events have documented solutions. Contributing to the knowledge base reduces resolution time by 34% on average.</p>
            </div>

            {/* Impact Category list tracking */}
            <div className="space-y-2 pt-2 border-t border-brand-low text-xs font-semibold text-brand-on-surface">
              <span className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Impact Categories</span>
              
              <div className="flex justify-between items-center py-1">
                <span>Service Outage</span>
                <span className="font-mono text-[#76777d]">24</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Data Integrity</span>
                <span className="font-mono text-[#76777d]">18</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Latent Errors</span>
                <span className="font-mono text-[#76777d]">56</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>System Maintenance</span>
                <span className="font-mono text-[#76777d]">112</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Slide-In / Overlaid article creator modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-lg border border-brand-highest p-6 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-brand-low">
                <span className="flex items-center gap-1.5 text-sm font-bold text-brand-on-surface">
                  <BookOpen className="h-4.5 w-4.5 text-brand-secondary" />
                  Publish Knowledge Entry
                </span>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="hover:bg-brand-low p-1 rounded"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateArticle} className="space-y-4 text-xs font-semibold text-brand-on-surface">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Entry Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Memory Leak in auth-session token cycle"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                  />
                </div>

                {/* Severity select list */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Target Impact Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface"
                  >
                    <option value="CRITICAL">Critical Outage</option>
                    <option value="WARNING">System Degraded</option>
                    <option value="INFO">Informational Rules</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">The Summary *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a concise SRE background overview of the anomalies..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface focus:outline-none"
                  />
                </div>

                {/* Documented Resolution */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Documented Resolution *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="What specific actions resolved the error cascades?"
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface focus:outline-none"
                  />
                </div>

                {/* Historical Outcome */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Historical Outcome</label>
                  <input
                    type="text"
                    placeholder="e.g. Mean Latency dropped to 150ms. No further anomalies reported."
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-on-surface-variant">Domain Tags</label>
                  <input
                    type="text"
                    placeholder="Separated by comma, e.g. SRE, Caching, Memory"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-surface-dim rounded text-xs text-brand-on-surface"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-brand-highest rounded hover:bg-brand-low"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white hover:bg-opacity-90 rounded font-bold"
                  >
                    Publish Post-Mortem
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
