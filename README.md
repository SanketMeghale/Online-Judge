# Online Judge

Online Judge is a modern coding practice and contest platform inspired by systems like LeetCode and Codeforces. It is designed to support secure code execution, automated evaluation, live contests, team battles, realtime collaboration, AI-assisted interview practice, and learner gamification.

The project follows a multi-service architecture so that core judging, realtime updates, AI workflows, and the user-facing application can scale independently.

## Project Overview

The platform allows users to browse programming problems, write solutions in a browser-based editor, run custom test cases, and submit code for automated judging. Submitted code is evaluated inside isolated Docker containers by distributed judge workers, which helps keep execution secure and prevents long-running programs from blocking the main API.

Beyond normal problem solving, the system includes contest support with realtime leaderboards, team-based contests, collaborative coding rooms, and an AI interviewer module that can simulate technical interviews and generate feedback reports.

## Main Features

- JWT-based user authentication and profile management
- Problem management with topics, difficulty levels, statements, samples, and hidden test cases
- Multi-language code submission support for C, C++, Java, and Python
- Docker-based judging with verdicts such as AC, WA, CE, RE, TLE, MLE, and SYSTEM_ERROR
- Custom test case runner for quick local-style execution
- Live individual and team contests
- Realtime contest leaderboard updates using WebSocket communication
- Collaboration rooms with shared code editing support
- AI interviewer service for mock technical interviews and feedback
- Gamification through XP, streaks, badges, and lightweight coding games
- Redis-backed caching for leaderboards, cooldown checks, pub/sub events, and presence

## Architecture & Deployment Model

The platform utilizes a modern decoupled architecture separating the user-facing web tier from the isolated execution engine:

```text
┌──────────────────────────────────────────────────────────────┐
│                    Vercel Cloud Platform                     │
│  ┌───────────────────────┐        ┌───────────────────────┐  │
│  │   React (Vite) SPA    │───────▶│ Express API Gateway   │  │
│  │   Client Application  │        │ (Serverless Functions)│  │
│  └───────────────────────┘        └───────────┬───────────┘  │
└───────────────────────────────────────────────┼──────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
  ┌─────────────────────────────┐ ┌───────────────────────────┐ ┌─────────────────────────────┐
  │   MongoDB Atlas & Redis     │ │  Isolated Execution Layer │ │   Judgo Intelligence Suite  │
  │   • Users, Submissions      │ │  • Judge0 CE Containerized│ │   • FAANG Bar Raiser Persona│
  │   • Contests, Leaderboards  │ │    Docker Sandboxes       │ │   • Progressive AI Hints    │
  │   • Company Sheets & Stats  │ │  • Multi-Language Runner  │ │   • Big-O Complexity Engine │
  └─────────────────────────────┘ └───────────────────────────┘ └─────────────────────────────┘
```

### 🐳 Execution Sandboxing vs. Vercel Serverless
> **Design Decision & Architecture Clarification:**  
> Vercel Serverless Functions execute in lightweight, ephemeral runtimes with short execution timeouts and cannot run nested Docker daemons. To maintain zero-compromise security and support multi-language compilation (C, C++, Java, Python, JavaScript), code execution is decoupled:
> - **API Gateway & Routing (Vercel):** Manages auth, session persistence, problem metadata, AI orchestration, and submission queueing.
> - **Sandboxed Execution Layer (Judge0 / Workers):** Submissions are securely dispatched to dedicated, containerized Judge0 CE sandboxes with strict CPU, wall-time, and memory isolation.

### 🔒 Security & Server-Side Grading
- **Zero-Leak Testcase Protection:** Public API endpoints (`/api/problems`, `/api/problems/:id`, `/api/contests`) strictly sanitize problem objects, omitting `hiddenTestCases` and internal judge keys.
- **Server-Side Evaluation:** All verification and verdict scoring occur exclusively in server-side services (`submission.service.js` & `judgeEvaluator.js`).

---

## 🤖 Judgo Intelligence Multi-Mode Assistant

Judgo features 5 specialized, individually tuned AI modes:
1. **Progressive Hint Engine:** 5-tier scaffolding (intuition $\rightarrow$ invariants $\rightarrow$ algorithm $\rightarrow$ pseudocode $\rightarrow$ optimal solution) preventing premature spoilers.
2. **Automated Code Review:** Mathematical Big-O Time & Space complexity breakdown, recursion call stack analysis, and edge-case vulnerability detection.
3. **FAANG Mock Interview Studio:** Strict Bar Raiser persona conducting realistic DSA, System Design, and Behavioral rounds with instant evaluation scorecards.
4. **Company-Wise Preparation Sheets:** Tailored roadmaps and hiring rubrics for Google, Meta, Amazon, Microsoft, Uber, and Apple.
5. **Personalized DSA Recommendations:** Data-driven weak-topic targeting calibrated against real submission accuracy and active streaks.

---

## Tech Stack

- **Frontend:** React 18, Vite, Monaco Editor, Framer Motion, Lucide Icons
- **Backend API:** Node.js, Express (REST API Gateway)
- **Database & Cache:** MongoDB Atlas, Redis
- **Code Execution:** Isolated Judge0 CE Containerized Sandboxes (Docker)
- **Authentication:** JWT, bcryptjs, Firebase Auth
- **AI Engine:** Google Gemini / Custom LLM Provider with Local Fallbacks

---

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Environment:**
   ```bash
   # Run frontend web client
   npm run dev:web

   # Run backend API
   npm run dev:api
   ```
