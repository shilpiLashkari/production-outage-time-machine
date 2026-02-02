const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow both Angular (4200) and React (3000/3006)
        methods: ["GET", "POST"]
    }
});

// Simulation State
let activeFailures = [];

io.on('connection', (socket) => {
    console.log('[Socket] New client connected:', socket.id);

    // Send initial state
    socket.emit('state-update', { activeFailures });

    // Handle "Deploy Fix" from Angular Admin
    socket.on('deploy-fix', (data) => {
        console.log('[Socket] Fix deployed:', data);
        activeFailures = []; // Clear failures
        // Broadcast success to everyone (React will see this)
        io.emit('fix-deployed', {
            timestamp: Date.now(),
            details: data,
            cleared: true
        });
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Client disconnected:', socket.id);
    });
});

// Simulate "Heartbeat" / Live Events every 2 seconds
setInterval(() => {
    const event = {
        type: 'LOG_ENTRY',
        message: `[LIVE] System process active (PID: ${Math.floor(Math.random() * 9999)})`,
        timestamp: Date.now()
    };
    io.emit('live-event', event);
}, 2000);

// Simulate Random Failures (AI Logic moved to Backend)
setInterval(() => {
    if (activeFailures.length === 0 && Math.random() > 0.9) { // 10% chance every 5s
        const incidents = [
            { name: 'Auth Service Latency', cause: 'JWT_EXPIRY Config Mismatch', fix: 'Rollback Config' },
            { name: 'DB Connection Timeout', cause: 'Pool Exhausted', fix: 'Restart Pool' },
            { name: 'API Gateway 502', cause: 'OOM Crash', fix: 'Increase Memory' }
        ];
        const incident = incidents[Math.floor(Math.random() * incidents.length)];

        activeFailures.push(incident);
        console.log('[Socket] ⚠️ Triggering Failure:', incident.name);

        io.emit('critical-alert', incident);
    }
}, 5000);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Real-time Server running on http://localhost:${PORT}`);
});
