"use client";
import { useRef, useState } from "react";
import MermaidView from "./components/MermaidView";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

type ChartType = "flowchart" | "timeline" | "rules";

const seeds: Record<ChartType, string> = {
  flowchart:
    "User signs up -> verify email -> complete profile -> choose plan -> checkout -> confirmation",
  timeline: `Jan 2023: Complaint filed
Mar 2023: Hearing scheduled
May 2023: Settlement negotiations
Aug 2023: Final order issued`,
  rules: `If user is a student and has valid ID, apply 20% discount.
If plan is annual, add a bonus month.
If user cancels within 14 days, full refund.`
};

export default function Page() {
  const [chartType, setChartType] = useState<ChartType>("flowchart");
  const [text, setText] = useState<string>(seeds.flowchart);
  const [loading, setLoading] = useState(false);
  const [mermaid, setMermaid] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [useSelection, setUseSelection] = useState(true);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const chartRef = useRef<HTMLDivElement>(null); // container ref for PNG download

  const [sel, setSel] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0
  });

  const handleSelect = () => {
    const el = taRef.current;
    if (!el) return;
    setSel({ start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 });
  };

  const getInputText = () => {
    if (!useSelection) return text;
    const { start, end } = sel;
    if (start !== end) {
      return text.slice(start, end);
    }
    return text;
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { chartType, text: getInputText() };
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error ?? "Generation failed");
      } else {
        setMermaid(data.mermaid);
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setMermaid("");
    setError(null);
  };

  // 📥 Download PNG
  const downloadPng = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(chartRef.current);
      saveAs(dataUrl, "diagram.png");
    } catch (err) {
      console.error("PNG export failed", err);
      setError("Failed to export PNG");
    }
  };

  return (
    <main className="container">
      <h1>LLM-Powered Chart Maker</h1>
      <p className="subtle">
        Paste or <strong>highlight</strong> the relevant text, choose a chart type, and generate a Mermaid diagram.
      </p>

      {/* Controls */}
      <div className="row gap wrap">
        <label className="label">Chart type</label>
        <select
          value={chartType}
          onChange={(e) => {
            const v = e.target.value as ChartType;
            setChartType(v);
            setText(seeds[v]);
          }}
          className="select"
        >
          <option value="flowchart">Flowchart</option>
          <option value="timeline">Timeline</option>
          <option value="rules">Rules Map</option>
        </select>
      </div>

      {/* Text area */}
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onSelect={handleSelect}
        rows={8}
        className="textarea"
        placeholder="Paste content here, then select the portion you want to diagram…"
      />

      {/* Buttons */}
      <div className="row gap">
        <button onClick={generate} disabled={loading} className="btn primary">
          {loading ? "Generating…" : "Generate Diagram"}
        </button>
        <button onClick={clearAll} className="btn">
          Clear
        </button>
        {mermaid && (
          <button onClick={downloadPng} className="btn secondary">
            Download PNG
          </button>
        )}
      </div>

      {/* Errors */}
      {error && <div className="error mt">{error}</div>}

      {/* Output */}
      {mermaid && mermaid.trim().length > 0 && (
        <>
          <h2 className="mt">Preview</h2>
          <div ref={chartRef}>
            <MermaidView code={mermaid} />
          </div>
          <div className="mt">
            <h3>Mermaid code</h3>
            <pre className="card code">{mermaid}</pre>
          </div>
        </>
      )}

      <footer className="muted mt-lg">
        Built with Next.js + TypeScript + Mermaid + Groq .
      </footer>
    </main>
  );
}
