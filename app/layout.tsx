import "./../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM-Powered Chart Maker",
  description: "Turn text into Flowcharts, Timelines, or Rules Maps via Mermaid + Groq"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
