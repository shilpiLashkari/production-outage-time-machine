# 🚀 Deployment Guide: Production Outage Time-Machine

This is a distributed system with three moving parts:
1.  **Backend** (Node.js + Socket.io)
2.  **Admin** (Angular)
3.  **Analytics** (React)

Because you have a **real backend** (not just static files), you cannot simply drop this on Netlify/Vercel. You need a server that can run Docker containers or Node.js.

Here are the two best ways to deploy this project.

---

## Option 1: The "Senior" Docker Way (AWS / DigitalOcean)
*Best for: Showing off Docker skills, full control.*

This workflow mimics a real enterprise CI/CD pipeline.

### Step 1: Install Docker Desktop 🐳
Make sure Docker Desktop is running on your machine.
[Download Here](https://www.docker.com/products/docker-desktop/)

### Step 2: Build & Push Images
You need to build your code into "Images" and push them to Docker Hub (like GitHub for binaries).

1.  **Create a Docker Hub Account** at [hub.docker.com](https://hub.docker.com/).
2.  **Login locally**:
    ```bash
    docker login
    ```
3.  **Build & Push**:
    Run these commands in your terminal:
    ```bash
    # 1. Build the Backend
    docker build -t your-username/time-machine-backend ./backend/realtime-server
    docker push your-username/time-machine-backend

    # 2. Build Angular Admin
    docker build -t your-username/time-machine-angular ./frontend/angular-admin
    docker push your-username/time-machine-angular

    # 3. Build React Analytics
    docker build -t your-username/time-machine-react ./frontend/react-analytics
    docker push your-username/time-machine-react
    ```

### Step 3: Run on Server (e.g., DigitalOcean Droplet)
1.  SSH into your remote server (`ssh root@your-ip`).
2.  Install Docker on the server.
3.  Run the system:
    ```bash
    # Create a network
    docker network create tm-net

    # Run Backend
    docker run -d --net tm-net --name backend -p 3001:3001 your-username/time-machine-backend

    # Run Frontends
    docker run -d --net tm-net --p 80:80 your-username/time-machine-angular
    docker run -d --net tm-net --p 3000:80 your-username/time-machine-react
    ```

---

## Option 2: The "Easy" PaaS Way (Render.com)
*Best for: Easy setup, free tier available.*

**Render** natively understands `docker-compose` and Node.js.

1.  Push your code to **GitHub**.
2.  Sign up for [Render.com](https://render.com).
3.  Click **"New +"** -> **"Blueprints"**.
4.  Connect your GitHub repo.
5.  Render will read the `docker-compose.yml` (or you can set up 3 separate services) and deploy them automatically.
    *   **Service 1 (Web Service)**: `backend/realtime-server` (Start Command: `node server.js`)
    *   **Service 2 (Static Site)**: `frontend/angular-admin` (Build Command: `npm run build`)
    *   **Service 3 (Static Site)**: `frontend/react-analytics` (Build Command: `npm run build`)

---

## ⚠️ Vital Config Change for Production
Right now, your Frontends are hardcoded to talk to `localhost:3001`. For production, you **MUST** change this.

**In `TimelineView.js` (React) and `app.component.ts` (Angular):**

```javascript
// CHANGE THIS:
const socket = io('http://localhost:3001');

// TO THIS (Your real domain):
const socket = io('https://your-backend-app.onrender.com'); 
// OR use an environment variable:
const socket = io(process.env.REACT_APP_BACKEND_URL);
```
