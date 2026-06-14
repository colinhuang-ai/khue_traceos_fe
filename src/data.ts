import { TraceEvent, KnowledgeBaseArticle } from "./types";

export const INITIAL_TRACES: TraceEvent[] = [
  {
    id: "EVT-2024-8842",
    eventName: "Latency Spike Cascade - Cluster A",
    component: "us-east-1.production.ingress",
    severity: "CRITICAL",
    assignedTo: "Sarah Chen",
    status: "Investigating",
    date: "2024-05-12",
    time: "14:20:00 UTC",
    metricsHeatmap: [
      60, 80, 75, 95,
      40, 50, 45, 55,
      20, 30, 90, 40,
      10, 15, 30, 50
    ],
    stages: [
      {
        name: "Ingress Gateway",
        status: "HTTP 503 Service Unavailable",
        startPct: 5,
        durationPct: 80,
        color: "bg-brand-error"
      },
      {
        name: "Auth-Service v2",
        status: "Timeout",
        startPct: 40,
        durationPct: 50,
        color: "bg-brand-warning"
      },
      {
        name: "Postgres Master",
        status: "Query: SELECT * FROM tokens WHERE...",
        startPct: 60,
        durationPct: 25,
        color: "bg-brand-info"
      },
      {
        name: "Redis Cache",
        status: "Cache Miss Loop",
        startPct: 15,
        durationPct: 45,
        color: "bg-brand-secondary"
      }
    ],
    logs: [
      {
        id: "log-1",
        author: "Sarah Chen",
        handle: "@schendev",
        timestamp: "14:22:10 UTC",
        content: "Confirmed anomaly in Ingress Gateway. Looks like a retry storm from the Auth-Service timeouts. Initiating circuit breaker pattern to prevent cascade.",
        tags: ["Action: Throttling"],
        attachment: {
          name: "metrics_dump.json",
          size: "1.2 MB"
        }
      },
      {
        id: "log-2",
        author: "TraceBot",
        handle: "AI Diagnostic",
        timestamp: "14:22:45 UTC",
        content: "Automated analysis detected 98% correlation between the Redis cache-miss loop and the Auth-Service latency. Root cause likely upstream in token validation logic.",
        isAI: true
      }
    ]
  },
  {
    id: "TR-9402",
    eventName: "API Gateway Timeout",
    component: "us-east-1.production.auth",
    severity: "CRITICAL",
    assignedTo: "John Doe",
    status: "Investigating",
    date: "2024-06-13",
    time: "17:45:10 UTC",
    metricsHeatmap: [
      70, 90, 85, 100,
      30, 60, 40, 70,
      15, 25, 95, 30,
      5, 10, 20, 45
    ],
    stages: [
      {
        name: "Ingress Gateway",
        status: "HTTP 504 Gateway Timeout",
        startPct: 0,
        durationPct: 100,
        color: "bg-brand-error"
      },
      {
        name: "Auth Provider",
        status: "Fatal SSL Handshake Fail",
        startPct: 10,
        durationPct: 90,
        color: "bg-brand-error"
      }
    ],
    logs: [
      {
        id: "log-3",
        author: "John Doe",
        handle: "@jdoedev",
        timestamp: "17:48:00 UTC",
        content: "Investigating API gateway timeouts. External token issuer returning SSL handshake failures.",
        tags: ["Blocked", "Network"]
      }
    ]
  },
  {
    id: "TR-9398",
    eventName: "Database Migration Success",
    component: "eu-west-2.staging.db",
    severity: "INFO",
    assignedTo: "System",
    status: "Completed",
    date: "2024-06-12",
    time: "22:15:33 UTC",
    metricsHeatmap: [
      10, 20, 15, 25,
      20, 30, 25, 30,
      30, 40, 35, 45,
      40, 50, 45, 60
    ],
    stages: [
      {
        name: "DB Migrator",
        status: "Migration #142 Executed",
        startPct: 0,
        durationPct: 100,
        color: "bg-brand-success"
      }
    ],
    logs: [
      {
        id: "log-4",
        author: "System",
        handle: "@db-migrator",
        timestamp: "22:16:00 UTC",
        content: "Database schema version upgraded to 1.42 successfully. 12 tables modified."
      }
    ]
  },
  {
    id: "TR-9381",
    eventName: "Memory Spike Detected",
    component: "k8s-cluster-01.pod-77x",
    severity: "WARNING",
    assignedTo: "Elena Smith",
    status: "Awaiting Triage",
    date: "2024-06-11",
    time: "08:11:04 UTC",
    metricsHeatmap: [
      40, 50, 60, 75,
      30, 40, 45, 55,
      20, 30, 40, 50,
      10, 15, 20, 30
    ],
    stages: [
      {
        name: "K8s Pod",
        status: "Memory usage > 85%",
        startPct: 0,
        durationPct: 70,
        color: "bg-brand-warning"
      }
    ],
    logs: []
  },
  {
    id: "TR-9377",
    eventName: "UI Component Error",
    component: "frontend.dashboard.v2",
    severity: "WARNING",
    assignedTo: "John Doe",
    status: "In Progress",
    date: "2024-06-10",
    time: "11:04:15 UTC",
    metricsHeatmap: [
      20, 25, 30, 40,
      15, 20, 22, 28,
      10, 12, 15, 20,
      5, 8, 10, 12
    ],
    stages: [
      {
        name: "JS Chunk",
        status: "Dynamic import failed",
        startPct: 10,
        durationPct: 30,
        color: "bg-brand-warning"
      }
    ],
    logs: []
  }
];

export const INITIAL_KB: KnowledgeBaseArticle[] = [
  {
    id: "KB-1021",
    title: "Distributed Database Deadlock on Batch Process",
    date: "May 12, 2024",
    eventId: "EVT-2024-8842",
    severity: "CRITICAL",
    summary: "A race condition was identified in the transaction coordinator during high-concurrency batch writes, leading to partial service degradation for the APAC region.",
    solution: "Implemented optimistic locking with exponential backoff on the coordinator level. Refined isolation levels for the batch processing microservice.",
    outcome: "99.9% reduction in deadlock errors. Batch throughput increased by 14% post-fix. Documentation updated in the Architecture Guidelines.",
    tags: ["Database", "Backend", "High-Load"]
  },
  {
    id: "KB-1019",
    title: "Intermittent API Latency in Auth Service",
    date: "May 08, 2024",
    severity: "WARNING",
    summary: "Observed spikes in authentication latency exceeding 2s during peak login hours. Preliminary root cause linked to cache-miss storming.",
    solution: "Upgraded Redis cluster size and introduced a jittered TTL to prevent synchronized cache expiration.",
    outcome: "Mean latency dropped to 150ms. No reported timeouts in subsequent 72-hour window.",
    tags: ["Security", "Caching", "SRE"]
  }
];
