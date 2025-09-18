"use client";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default"
});

export default function MermaidView({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setError(null);
      if (!ref.current) return;
      ref.current.innerHTML = "";
      try {
        const { svg } = await mermaid.render(`d_${Date.now()}`, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e: any) {
        setError(e?.message ?? "Render error");
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const copySVG = async () => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;
    const svgText = new XMLSerializer().serializeToString(el);
    await navigator.clipboard.writeText(svgText);
    alert("✅ SVG copied to clipboard");
  };

  const downloadPNG = async () => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;

    const svgText = new XMLSerializer().serializeToString(el);

    // ✅ Ensure SVG has proper namespace so it's self-contained
    const svgWithNs = svgText.replace(
      "<svg",
      `<svg xmlns="http://www.w3.org/2000/svg"`
    );

    const svgBlob = new Blob([svgWithNs], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "diagram.png";
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="stack">
      <div className="row gap">
        <button onClick={copySVG} className="btn">Copy SVG</button>
      </div>
      {error && <div className="error">Mermaid error: {error}</div>}
      <div ref={ref} className="card scroll" />
    </div>
  );
}
