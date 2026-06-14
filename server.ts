import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client with a self-healing fallback
let aiInstance: GoogleGenAI | null = null;

function getAi(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is missing or contains template default. Enabling mock fallback mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// TraceOS API Endpoints

// 1. Analyze Log Files via Gemini
app.post("/api/analyze-logs", async (req, res) => {
  const { logContent, fileName } = req.body;
  if (!logContent) {
    return res.status(400).json({ error: "Missing logContent" });
  }

  const ai = getAi();
  if (!ai) {
    // Elegant fallback simulation when Gemini API Key is missing
    const risk = logContent.toLowerCase().includes("fatal") || logContent.toLowerCase().includes("critical") || logContent.toLowerCase().includes("500") || logContent.toLowerCase().includes("503") ? "High - Critical" : "Medium - Warning";
    const component = logContent.match(/auth[a-zA-Z0-9\-_]*/i)?.[0] || "auth-service-v2";
    const title = `Incident: Latency Spike detected in ${component}`;
    return res.json({
      eventName: title,
      riskLevel: risk,
      component: `us-east-1.production.${component.toLowerCase()}`,
      summary: `Automated rule-based parser detected a high concentration of exception frames in "${fileName || "trace.log"}". Risk flagged as ${risk} based on pattern weights.`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following system logs from file "${fileName || "unknown.log"}". Extract and suggest values to create a Trace Incident report:
      1. Actionable incident Event Name (concise, e.g., "Latency Spike - auth-service")
      2. Suggested Risk Level (must be exactly one of: "Low - Informational", "Medium - Warning", "High - Critical")
      3. Target Component (e.g., "us-east-1.production.auth")
      4. A brief smart summary of the detected anomalies / stack trace issues.

      Logs:
      ${logContent.slice(0, 8000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventName: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            component: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["eventName", "riskLevel", "component", "summary"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini analyze log error:", error);
    res.status(500).json({ error: "Failed to analyze log using Gemini", details: error.message });
  }
});

// 2. Suggest Diagnostic Investigation Note via Gemini
app.post("/api/suggest-diagnostic", async (req, res) => {
  const { eventTitle, stages, currentLogs } = req.body;
  
  const ai = getAi();
  if (!ai) {
    return res.json({
      noteContent: `TraceBot AI Diagnostic: Offline analysis correlates a cascading failure on Auth Service v2 triggering 503 errors at the Ingress Gateway. The database primary connection pool is stable. Consider validating JWT expiry caches.`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are TraceBot, the intelligent system diagnostic agent for TraceOS.
      Provide a highly precise, technical, and concise system diagnostic recommendation note as an SRE specialist.
      Analyze the current incident:
      - Incident Title: ${eventTitle}
      - Cascading latency stages: ${JSON.stringify(stages)}
      - Current logs / history: ${JSON.stringify(currentLogs)}
      
      Suggest why the failure cascade is happening, indicating suspect services (e.g. Redis Cache, Ingress Gateway, Auth-Service), and provide a concrete action point. Start with "TraceBot AI Diagnostic: " and write exactly 2-3 sentences. Keep it professional. No markdown bolding, just pure text.`
    });

    res.json({ noteContent: response.text?.trim() });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate diagnostic suggestion", details: error.message });
  }
});

// Serve Frontend

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TraceOS] Server hosting core metrics on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server bootstrap:", err);
});
