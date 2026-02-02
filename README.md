# 🕰️ Production Outage Time-Machine

**Have you ever wished you could just "Ctrl+Z" a production outage?**

That's why I built this.

---

<details open>
<summary><strong>🧩 Why I Built This (The Problem)</strong></summary>
<br>

We've all been there: it's 3 AM, PagerDuty is screaming, and the site is down.
*   **The Panic**: You're looking at a latency graph that looks like a hockey stick.
*   **The Confusion**: You check the logs, but there are millions of them. You check Slack, but nobody knows who deployed what.
*   **The Question**: You just want to know *one thing*: **"What changed right before it broke?"**

I built the **Time-Machine** to answer that question instantly. It records every deployment and config change, overlays them on your metrics, and lets you "rewind" the dashboard to see exactly what the system looked like the moment it crashed.

</details>

<details>
<summary><strong>🏗️ How I Designed It (Architecture)</strong></summary>
<br>

I wanted this to feel like a real enterprise system, not just a "Todo App". So, I split it into a **Micro-Frontend** architecture.

### 1. The "Control Reporting" (Angular 17)
I used **Angular** for the Admin Console because it's strict. When I'm trying to fix a P0 outage, I don't want runtime errors. I want type safety. I want stability. Angular gives me that "Cockpit" feel where I know the "Deploy Fix" button is going to work.

### 2. The "Investigation Board" (React + D3.js)
For the Analytics Dashboard, I needed speed. I used **React** and **D3.js** to render the live "Red Wave" latency chart. It needs to handle high-frequency updates (60fps) without lagging, which React excels at.

### 3. The "Brain" (Node.js + Socket.io)
To make them talk, I built a **Node.js WebSocket server**. It acts as the central nervous system. When the Angular app triggers a fix, the Node server instantly broadcasts it, and the React app turns green in real-time. No refreshing required.

</details>

<details>
<summary><strong>🛠️ My Tech Stack</strong></summary>
<br>

Here is the specific tech I picked and why:

| Tech | Why I chose it |
| :--- | :--- |
| **Angular 17** | To ensure type-safety in the critical "Admin" path. |
| **React 18** | For its massive ecosystem of visualization libraries (like D3). |
| **D3.js** | To build a custom, smooth area chart (not just a generic library). |
| **Socket.io** | Because HTTP polling is too slow for a "live" war room dashboard. |
| **RxJS** | To handle the "scrubbing" timeline interactions without flooding the logs. |
| **Playwright** | To automate the testing. I wrote a script that literally opens the browser and fixes a bug to prove it works. |

</details>

<details>
<summary><strong>🚀 Cool Features I Added</strong></summary>
<br>

*   **⚡ Real-Time Sync**: Bidirectional communication between micro-frontends using **Socket.io**.
*   **💓 Live Data Heartbeat**: The timeline flashes **white** every 2 seconds to visualize incoming data packets from the backend, simulating a high-traffic production control room.
*   **🔔 "Cyberpunk" Alerts**: Visual modal overlays and toast notifications for critical events, replacing annoying pager sounds.
*   **📈 Live Latency Wave**: A custom D3.js area chart that visualizes stability over time.
*   **Time-Travel Scrubbing**: You can literally drag a blue line back in time to inspect the logs from 10 minutes ago.
*   **AI Diagnostics**: Instead of just saying "Error", the system guesses *why*. (e.g., "I'm 95% sure it's the `JWT_EXPIRY` config").
*   **Cyberpunk UI**: Beacuse if you're going to be debugging at 3 AM, the dashboard should at least look cool (Dark mode, neon accents).

</details>

<details>
<summary><strong>📸 See It In Action</strong></summary>
<br>

### The Investigation (React)
This is where you spot the problem. That big red wave? That's bad.
![Analytics Dashboard](assets/analytics%20screenshot.png)

### The Fix (Angular)
This is where you save the day. The AI tells you what's wrong, and you hit the button.
![Admin Control Room](assets/production%20screesnhot.png)

</details>

---

## 🏁 Run It Yourself

I made it super easy to try out. You don't need to install 50 things.

### Quick Start (Local)
1.  **Clone the repo**.
2.  **Double-click `start-all.bat`**.

### 🐳 Run with Docker (Recommended)
This is a senior-level project, so of course it's containerized.

**Prerequisite:** You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
docker compose up --build
```
*(Note: If using older Docker versions, try `docker-compose up --build`)*

This will spin up:
*   **Backend**: `http://localhost:3001`
*   **Control Room**: `http://localhost:4200`
*   **Analytics**: `http://localhost:3000`

---

*"Debug like a scientist, not a detective."*
