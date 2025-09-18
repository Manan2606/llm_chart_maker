import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs"; // ensures Node.js runtime on Vercel

// ✅ Validate incoming requests
const schema = z.object({
  chartType: z.enum(["flowchart", "timeline", "rules"]),
  text: z.string().min(10, "Please provide at least a sentence.")
});

// 🧠 System role: enforce proper Mermaid syntax
const SYSTEM_BASE = `You are a diagram generator.
Return ONLY valid Mermaid code.
Do not add explanations, comments, or extra text outside the Mermaid block.

Rules for flowcharts:
- Always start with: flowchart TD
- Convert user steps into labeled nodes with unique IDs (A, B, C…).
- Each node label must be inside ["..."].
- Connect nodes inline on the same line, e.g.:
  A["User signs up"] --> B["Verify email"] --> C["Complete profile"]
- Do NOT output raw text arrows like "User signs up -> verify email".
- Do NOT declare nodes separately.
- Node names must be short (A, B, C), labels go in brackets.

Rules for timelines:
- Always start with: timeline
- Each line = "YYYY-MM-DD : Event" or "YYYY MMM : Event"
- Keep labels short and clear.

Rules for rules maps:
- Always start with: mindmap
- Root node = "Rules"
- Use nested indentation for branches and leaves.
- Example:
  mindmap
    root((Rules))
      Student
        Discount 20%
      Annual Plan
        Bonus month
      Cancellation
        Full refund
`;

// 📊 Chart-type specific templates
const TEMPLATES: Record<string, string> = {
  flowchart: `Task: Convert the user's text into a clean Mermaid flowchart.`,
  timeline: `Task: Convert the user's text into a Mermaid timeline.`,
  rules: `Task: Convert the user's text into a Mermaid mindmap for rules/conditions.`
};

// 🛠 Build user prompt
function buildUserPrompt(chartType: "flowchart" | "timeline" | "rules", text: string) {
  const template = TEMPLATES[chartType];
  return `${template}\n\nUser Text:\n${text}`;
}

// 📡 POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chartType, text } = schema.parse(body);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }

    // 🌐 Call Groq API
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Groq free model
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_BASE },
          { role: "user", content: buildUserPrompt(chartType, text) }
        ]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: errText }, { status: 502 });
    }

    const data = await resp.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";

    const cleaned = raw
      .replace(/^```(mermaid)?/i, "")
      .replace(/```$/i, "")
      .trim();

    // ✅ Verify it actually looks like Mermaid
    if (!/^(flowchart|timeline|mindmap)/.test(cleaned)) {
      return NextResponse.json(
        { error: "Model did not return valid Mermaid content", raw },
        { status: 422 }
      );
    }

    return NextResponse.json({ mermaid: cleaned });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
