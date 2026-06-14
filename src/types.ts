export interface TimelineStage {
  name: string;
  status: string;
  startPct: number; // 0 to 100
  durationPct: number; // 0 to 100
  color: string;
}

export interface TimelineLog {
  id: string;
  author: string;
  handle: string;
  timestamp: string;
  content: string;
  isAI?: boolean;
  tags?: string[];
  attachment?: {
    name: string;
    size: string;
  };
}

export interface TraceEvent {
  id: string;
  eventName: string;
  component: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  assignedTo: string;
  status: 'Investigating' | 'Completed' | 'Awaiting Triage' | 'In Progress';
  date: string;
  time: string;
  stages: TimelineStage[];
  logs: TimelineLog[];
  metricsHeatmap?: number[]; // list of 16 numbers representing the matrix heatmap
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  date: string;
  eventId?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  summary: string;
  solution: string;
  outcome: string;
  tags: string[];
}
