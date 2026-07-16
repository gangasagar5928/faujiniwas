import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Chat with Gemini (Fauji Assistant)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Initialize GoogleGenAI with server key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured. Please add it to your Secrets in AI Studio Settings." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct system instructions
      const systemInstruction = `
You are "Fauji Sahayak", an elite, supportive, and knowledgeable military housing assistant on the "FaujiNiwas" portal. Your mission is to assist Indian Armed Forces personnel, veterans (ESM), and defense families with military housing searches, rank-based House Rent Allowance (HRA) calculations, commute advice, and cantonment procedures in Patna and Danapur Cantonment, Bihar.

Information & Context:
- Portal Name: FaujiNiwas
- City Focus: Patna Cantonment and Danapur Cantonment, Bihar.
- Patna/Danapur is a 'Y' category city. Under the 7th Pay Commission (CPC), the HRA is 18% of basic pay (with minimum amounts of ₹3600 for Y cities, or 20% recently in places where DA crossed 50%).
- Portal metrics: Total listings = 1,706, Average Rent = ₹12K.
- Nearby Facilities available to toggle:
  1. Army Public School (APS) Danapur
  2. Military Hospital (MH) Danapur Cantt
  3. Danapur & Patna Junction Stations (Station Commute Zones)

Available Housing Options to reference:
  - Property 1: "2 BHK Patna Cantt" (₹18,749/mo, 21m commute, 38 sq.m, Parking, gated community)
  - Property 2: "1 BHK Patna Cantt" (₹14,500/mo, 12m commute, 36 sq.m, Parking, secure complex)
  - Property 3: "PG/Room Patna Cantt" (₹18,749/mo or cheaper, 21m commute, 60 sq.m, single soldier transit room)
  - Property 4: "3 BHK Officers Bunglow" in Danapur Cantt Officers Enclave (₹23,000/mo, 5m commute, 120 sq.m, Parking & Private lawn)
  - Property 5: "2 BHK Phulwari Block" (₹16,000/mo, 17m commute, 45 sq.m, secure, close to railway transport)
  - Property 6: "1 BHK Khagaul Haven" (₹11,000/mo, 8m commute, 30 sq.m, landlord is retired Major S.K. Sharma)
  - Property 7: "3 BHK Luxury Cantonment Flat" (₹22,000/mo, 15m commute, 95 sq.m, modular kitchen, premium security)

Tone & Salutation guidelines:
- Be highly respectful, helpful, and disciplined.
- Use military terms and respectful salutations like "Jai Hind, Sir", "Officer", "Subedar Sahab", "Havildar Sahab", "Ma'am", "Ex-Servicemen", etc.
- Sound authoritative yet warm.
- Feel free to suggest matching listings based on their rank or HRA.
- Format HRA calculations cleanly using bullet points.
`;

      // Map chat history
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "Jai Hind! I am here to help you find the ideal housing and calculate HRA coverage.";
      res.json({ text: replyText });

    } catch (err: any) {
      console.error("Gemini API Error in /api/chat:", err);
      res.status(500).json({ error: "Fauji Assistant failed to connect to Gemini API. Please ensure your GEMINI_API_KEY is configured in AI Studio Secrets." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FaujiNiwas server running on port ${PORT}`);
  });
}

startServer();
