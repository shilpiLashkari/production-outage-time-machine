import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { io } from 'socket.io-client';
import { EVENTS } from './mockData';

const userScrub$ = new Subject();

export const TimelineView = () => {
    const svgRef = useRef(null);
    const [logs, setLogs] = useState([]);
    const [toast, setToast] = useState(null);

    // Initialize Socket Connection & Listeners
    useEffect(() => {
        // Use environment variable or fallback
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const socket = io(backendUrl);

        socket.on('connect', () => {
            addLog('[SYSTEM] 🟢 Connected to Real-time Backend');
        });

        socket.on('fix-deployed', () => {
            addLog(`[SYNC] 🟢 FIX DEPLOYED by Admin Console! System restoring...`);
            showToast("SYSTEM RESTORED via SYNC", "success");
            triggerVisualEffect("#0f0");
        });

        socket.on('live-event', (event) => {
            showToast("New Data Packet Received", "info");
            addLog(event.message);
            triggerVisualEffect("#fff"); // Flash white for events
        });

        socket.on('critical-alert', (alert) => {
            addLog(`[ALERT] ${alert.name} detected!`);
        });

        return () => socket.disconnect();
    }, []);

    // Initialize D3 Timeline
    useEffect(() => {
        if (!svgRef.current) return;
        const width = 800, height = 150;
        const svg = d3.select(svgRef.current);

        // Setup Base UI
        svg.selectAll("*").remove();
        svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#1f2833");

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
        const scrubber = svg.append("line")
            .attr("y1", 0).attr("y2", height)
            .attr("stroke", "#66fcf1").attr("stroke-width", 2);

        // Event Markers
        svg.selectAll("circle")
            .data(EVENTS)
            .enter().append("circle")
            .attr("cx", d => xScale(d.time))
            .attr("cy", height / 2)
            .attr("r", 8)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff").attr("stroke-width", 2)
            .on("mouseover", function () { d3.select(this).transition().attr("r", 12); })
            .on("mouseout", function () { d3.select(this).transition().attr("r", 8); });

        // Scrubber Interaction
        svg.on("mousemove", (event) => {
            const [x] = d3.pointer(event);
            scrubber.attr("x1", x).attr("x2", x);
            userScrub$.next(xScale.invert(x));
        });
    }, []);

    // RxJS Stream Handler
    useEffect(() => {
        const sub = userScrub$.pipe(debounceTime(50)).subscribe(time => {
            addLog(`[RxJS] Scrubbing to time: ${time.toFixed(2)}%`);
        });
        return () => sub.unsubscribe();
    }, []);

    // Helper Functions
    const addLog = (msg) => setLogs(prev => [msg, ...prev.slice(0, 4)]);

    const showToast = (msg, type) => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 2000); // Auto-hide
    };

    const triggerVisualEffect = (color) => {
        d3.select(svgRef.current).append("rect")
            .attr("width", 800).attr("height", 150)
            .attr("fill", color).attr("opacity", 0.5)
            .transition().duration(1000).attr("opacity", 0)
            .remove();
    };

    return (
        <div style={{ padding: '20px', color: '#66fcf1', fontFamily: "'Segoe UI', sans-serif" }}>
            <h2 style={{ borderBottom: '2px solid #66fcf1', paddingBottom: '10px' }}>ANALYTICS TIMELINE</h2>

            <svg ref={svgRef} width="800" height="150" style={{ border: '1px solid #45a29e', borderRadius: '4px', cursor: 'crosshair', marginTop: '20px' }}></svg>

            {/* Console Logs */}
            <div style={{
                marginTop: '15px', background: '#050505', border: '1px solid #333',
                borderRadius: '6px', color: '#00ff41', fontFamily: "'Fira Code', monospace",
                padding: '12px', height: '120px', overflowY: 'auto'
            }}>
                {logs.length === 0 && <div style={{ opacity: 0.5 }}>&gt; Waiting for stream...</div>}
                {logs.map((log, i) => <div key={i}><span style={{ color: '#008F11', marginRight: '8px' }}>$</span>{log}</div>)}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: toast.type === 'success' ? 'rgba(0, 255, 65, 0.9)' : 'rgba(102, 252, 241, 0.9)',
                    color: '#000', padding: '10px 20px', borderRadius: '4px',
                    boxShadow: '0 0 15px rgba(102, 252, 241, 0.5)', fontWeight: 'bold', zIndex: 100
                }}>
                    {toast.type === 'success' ? '✔' : 'ℹ'} {toast.message}
                </div>
            )}
        </div>
    );
};

// New Component for Latency Chart
const LatencyChart = ({ isPaused }) => {
    const d3Container = useRef(null);
    const [data, setData] = useState(d3.range(50).map(() => Math.random() * 50 + 50));

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setData(prev => {
                const newValue = Math.random() * 100 + 50; // Random ms between 50-150
                return [...prev.slice(1), newValue];
            });
        }, 100); // 10Hz Update
        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if (!d3Container.current) return;

        const width = 800;
        const height = 60;
        const svg = d3.select(d3Container.current);
        svg.selectAll("*").remove();

        const x = d3.scaleLinear().domain([0, 49]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 200]).range([height, 0]);

        const area = d3.area()
            .x((d, i) => x(i))
            .y0(height)
            .y1(d => y(d))
            .curve(d3.curveBasis);

        // Gradient
        const gradientId = "latency-gradient";
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff4b4b").attr("stop-opacity", 0.6);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ff4b4b").attr("stop-opacity", 0);

        svg.append("path")
            .datum(data)
            .attr("fill", `url(#${gradientId})`)
            .attr("stroke", "#ff4b4b")
            .attr("stroke-width", 1.5)
            .attr("d", area);

    }, [data]);

    return (
        <svg ref={d3Container} width="100%" height="60" viewBox="0 0 800 60" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}></svg>
    );
};
