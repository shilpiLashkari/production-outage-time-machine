import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor
import { Component } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="control-room-container">
      <!-- Critical Alert Modal -->
      <div *ngIf="systemStatus === 'CRITICAL ALERT'" class="alert-modal">
        <div class="alert-content">
           <h2>⚠️ SYSTEM FAILURE DETECTED</h2>
           <p>Immediate Action Required</p>
           <button (click)="acknowledgeAlert()">ACKNOWLEDGE</button>
        </div>
      </div>

      <header>
        <h1>🚨 Production Time-Machine</h1>
        <span class="status-indicator" [class.danger]="systemStatus === 'CRITICAL ALERT'">{{ systemStatus }}</span>
      </header>
      
      <main>
        <aside class="sidebar">
          <!-- Active Failure List -->
          <div class="card" [class.critical]="activeFailures.length > 0">
            <h3>Failures</h3>
            <p *ngIf="activeFailures.length === 0" class="good-text">No Active Incidents</p>
            <div *ngIf="activeFailures.length > 0">
               <p *ngFor="let failure of activeFailures">{{ failure }}</p>
               <div class="action-buttons">
                 <button *ngIf="systemStatus === 'CRITICAL ALERT'" (click)="acknowledgeAlert()" class="btn-warn">ACKNOWLEDGE</button>
                 <button (click)="deployFix()" class="btn-deploy">DEPLOY FIX</button>
               </div>
            </div>
          </div>
        </aside>

        <section class="content-area">
          <h2>Outage Timeline</h2>
          <div class="scrubber-container" (mousemove)="onScrub($event)">
              <div class="timeline-track"></div>
              <div class="scrubber-head" [style.left.%]="scrubberPosition"></div>
          </div>
          <div class="hint-text">Move mouse to scrub time (Angular + Events)</div>

          <!-- Console Logs -->
          <div class="console-box">
            <div *ngFor="let log of logs" class="log-entry">{{ log }}</div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    /* Cleaned up CSS */
    .control-room-container { background: #000; color: #fff; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
    main { display: flex; margin-top: 20px; gap: 20px; }
    .sidebar { width: 300px; }
    .content-area { flex: 1; }
    
    .card { background: #111; padding: 15px; border: 1px solid #333; border-radius: 4px; }
    .card.critical { border-color: red; box-shadow: 0 0 10px red; }
    .good-text { color: var(--success-color, #0f0); }
    
    .status-indicator { padding: 5px 15px; border-radius: 4px; background: #0f0; color: #000; font-weight: bold; }
    .status-indicator.danger { background: red; color: white; animation: pulse 1s infinite; }
    
    .action-buttons { margin-top: 10px; display: flex; gap: 10px; }
    button { border: none; padding: 8px 16px; cursor: pointer; font-weight: bold; }
    .btn-warn { background: #fc0; color: #000; }
    .btn-deploy { background: #00d4ff; color: #000; }

    .console-box { background: #050505; color: #0f0; height: 150px; overflow-y: auto; padding: 10px; border: 1px solid #333; font-family: monospace; }
    
    /* Scrubber Styles */
    .scrubber-container { position: relative; height: 40px; background: #222; margin: 20px 0; cursor: crosshair; }
    .timeline-track { position: absolute; top: 50%; width: 100%; height: 2px; background: #555; }
    .scrubber-head { position: absolute; height: 100%; width: 2px; background: cyan; }

    /* Modal */
    .alert-modal { position: fixed; inset: 0; background: rgba(50,0,0,0.5); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); z-index: 999; }
    .alert-content { background: #000; border: 2px solid red; padding: 40px; text-align: center; box-shadow: 0 0 50px red; }
    
    @keyframes pulse { 50% { opacity: 0.5; } }
  `]
})
export class AppComponent {
  title = 'angular-admin';
  scrubberPosition = 0;
  logs: string[] = [];

  systemStatus = 'SYSTEM READY';
  activeFailures: string[] = [];
  activeIncident: any = null;
  private socket: Socket;

  constructor() {
    // Use environment variable if available, otherwise fallback to localhost
    const backendUrl = (window as any).env?.backendUrl || 'http://localhost:3001';
    this.socket = io(backendUrl);
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('connect', () => this.addLog('[System] 🟢 Connected to Neural Backend'));

    this.socket.on('critical-alert', (incident: any) => {
      this.activeIncident = incident;
      this.activeFailures = [incident.name];
      this.systemStatus = 'CRITICAL ALERT';
      this.addLog(`[ALERT] ⚠️ ${incident.name} detected.`);
    });

    this.socket.on('fix-deployed', (data: any) => {
      if (data.cleared) {
        this.activeFailures = [];
        this.activeIncident = null;
        this.systemStatus = 'SYSTEM READY';
        this.addLog('[System] Fix confirmed. Metrics normalized.');
      }
    });
  }

  acknowledgeAlert() {
    this.systemStatus = 'INVESTIGATING';
    this.addLog(`[User] Locked on target. Investigating cause...`);
  }

  deployFix() {
    if (!this.activeIncident) return;
    this.systemStatus = 'DEPLOYING FIX...';
    this.addLog(`[User] Deploying Remediation Protocol...`);
    this.socket.emit('deploy-fix', this.activeIncident);
  }

  addLog(message: string) {
    this.logs = [message, ...this.logs.slice(0, 5)];
  }

  onScrub(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const x = event.clientX - target.getBoundingClientRect().left;
    const percentage = Math.max(0, Math.min(100, (x / target.clientWidth) * 100));
    this.scrubberPosition = percentage;
  }
}
