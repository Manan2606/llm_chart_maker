# 📊 LLM-Powered Chart Maker

Turn text into **Flowcharts**, **Timelines**, or **Rules Maps** (mindmaps) using AI.  
Built with **Next.js + TypeScript + Node.js**, powered by **Groq LLM** (free tier), and rendered with **Mermaid.js**.  
Deployed on **Vercel** (free hosting).

---

## 🚀 Demo

- Live App: llm-chart-maker-xabj-2fhui1210-manans-projects-b041c076.vercel.app
- GitHub Repo: https://github.com/Manan2606/llm_chart_maker

---

## ✨ Features

- Paste or **highlight** text → convert into a diagram instantly.
- Choose chart type: **Flowchart**, **Timeline**, **Rules Map**.
- Get live **Mermaid preview**.
- Export: **Copy SVG** or **Download PNG**.
- Optional: AI explains the diagram in **3 bullets**.

---

## 🛠 Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Node.js runtime API** (server-side, calls LLM)
- **Groq LLaMA 3.1** (fast, free LLM via Chat Completions API)
- **Mermaid.js** (text-to-diagram rendering)
- **Zod** (input validation)

---

## ⚙️ Setup

Clone and install:

```bash
git clone <YOUR_REPO_URL>
cd llm-chart-maker
npm install
```

Set environment variable:

cp .env.example .env.local

Run locally:

npm run dev

# open http://localhost:3000

🌐 Deploy on Vercel (Free)

Push repo to GitHub.

Import project in Vercel.

Add GROQ_API_KEY under Project → Settings → Environment Variables.

OR

To run the project with your key:

Create a file named .env.local in the root folder.

Add your key inside it like this:

GROQ_API_KEY=sk-proj-xxxxxxxx

Deploy → you’ll get a live URL.

🧠 How It Works

Frontend (page.tsx) → user enters text, picks chart type.

API (route.ts) → validates input, sends prompt to Groq LLM.

LLM → returns Mermaid code (flowchart/timeline/mindmap).

Mermaid → renders interactive chart in the browser.

Export → user can copy SVG or download PNG.

✅ Submission Checklist

Live Vercel app link

GitHub repo link

README with setup + explanation

Clean, documented TypeScript code

---
