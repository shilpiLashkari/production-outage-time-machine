import React, { useState } from 'react';
import { TimelineView } from './TimelineView';
import { motion, AnimatePresence } from 'framer-motion';

// --- MODAL COMPONENT (Replaces Alerts) ---
const Modal = ({ isOpen, onClose, title, content, type = 'info' }) => {
    if (!isOpen) return null;

    const typeColors = {
        info: '#66fcf1',
        warning: '#ffc107',
        error: '#ff4b4b'
    };

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                        background: '#1f2833', padding: '30px', borderRadius: '12px', width: '400px',
                        borderLeft: `5px solid ${typeColors[type] || typeColors.info}`,
                        color: '#c5c6c7', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <h2 style={{ marginTop: 0, color: typeColors[type] }}>{title}</h2>
                    <p style={{ lineHeight: 1.6 }}>{content}</p>
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '20px', padding: '10px 20px', background: typeColors[type], border: 'none',
                            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- MAIN APP ---
function App() {
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });

    const handleEventClick = (event) => {
        // Replaces alert('Event clicked')
        setModal({
            isOpen: true,
            title: `${event.type} Details`,
            content: `Timestamp: ${event.time}s | Payload: ${JSON.stringify(event.payload || {})}`,
            type: event.type === 'FAILURE' ? 'error' : 'info'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ fontFamily: "'Roboto', sans-serif" }}
        >
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                    <motion.h1
                        initial={{ x: -50 }} animate={{ x: 0 }}
                        style={{ color: '#66fcf1', textTransform: 'uppercase', letterSpacing: '2px' }}
                    >
                        Analytics Dashboard
                    </motion.h1>
                    <p style={{ color: '#888' }}>Real-time Correlation Engine</p>
                </header>

                <section style={{ marginBottom: '40px' }}>
                    <TimelineView onEventClick={handleEventClick} />
                </section>

                <motion.div
                    layout
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
                >
                    {/* Card 1 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{ background: '#1f2833', padding: '20px', borderRadius: '8px', borderTop: '3px solid #ff4b4b' }}
                    >
                        <h3 style={{ color: '#c5c6c7', marginTop: 0 }}>Active Incidents</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff4b4b' }}>1</div>
                        <p style={{ color: '#666' }}>Auth Service Latency Spike</p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{ background: '#1f2833', padding: '20px', borderRadius: '8px', borderTop: '3px solid #66fcf1' }}
                    >
                        <h3 style={{ color: '#c5c6c7', marginTop: 0 }}>System Health</h3>
                        <div style={{ fontSize: '1.5rem', color: '#66fcf1' }}>98.2% Uptime</div>
                        <p style={{ color: '#666' }}>Last 24 Hours</p>
                    </motion.div>
                </motion.div>
            </div>

            <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
        </motion.div>
    );
}

export default App;
