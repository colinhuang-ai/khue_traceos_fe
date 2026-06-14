import React from "react";
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  FileText, 
  BookOpen, 
  Settings, 
  HelpCircle,
  Activity
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole?: string;
}

export default function Sidebar({ currentTab, setCurrentTab, userRole = "Admin User" }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "reporting", label: "Reporting", icon: BarChart3 },
    { id: "entry-form", label: "Entry Form", icon: FileText },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen },
  ];

  return (
    <aside 
      id="sidebar-container"
      className="w-64 bg-[#1b1b1d] text-[#e4e2e4] flex flex-col justify-between border-r border-[#303032] shrink-0 h-screen sticky top-0"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#303032]">
        <div className="flex items-center gap-3">
          <div className="bg-brand-secondary p-2 rounded-md">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">TraceOS</h1>
            <p className="text-xs text-brand-on-primary-container tracking-wider font-medium uppercase">
              Extraordinary Events
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? "bg-[#303032] text-white border-l-4 border-brand-secondary pl-3" 
                  : "text-[#c6c6cd] hover:bg-[#252528] hover:text-white"
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? "text-brand-secondary" : "text-[#76777d]"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Settings & Profiler */}
      <div className="p-4 border-t border-[#303032] space-y-4">
        <div className="space-y-1">
          <button 
            id="nav-settings"
            onClick={() => setCurrentTab("settings")}
            className="w-full flex items-center gap-3.5 px-4 py-2 text-xs font-medium text-[#c6c6cd] hover:text-white rounded-md hover:bg-[#252528] transition-all"
          >
            <Settings className="h-4 w-4 text-[#76777d]" />
            Settings
          </button>
          <button 
            id="nav-support"
            onClick={() => setCurrentTab("support")}
            className="w-full flex items-center gap-3.5 px-4 py-2 text-xs font-medium text-[#c6c6cd] hover:text-white rounded-md hover:bg-[#252528] transition-all"
          >
            <HelpCircle className="h-4 w-4 text-[#76777d]" />
            Support
          </button>
        </div>

        {/* User Badge Profile info */}
        <div className="flex items-center gap-3 p-2 bg-[#252528] rounded-md">
          <div className="h-8 w-8 rounded-full bg-brand-secondary flex items-center justify-center text-xs font-bold text-white uppercase">
            {userRole.split(" ").map(w => w[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">{userRole}</h4>
            <p className="text-[10px] text-brand-on-primary-container truncate">System Controller</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
