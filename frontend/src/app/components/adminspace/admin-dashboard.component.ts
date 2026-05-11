import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

declare var Chart: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">Admin<span>Panel</span></div>
        </div>
        <nav class="sidebar-nav">
          <a (click)="setTab('stats')" [class.active]="activeTab === 'stats'">
            <i class="icon-dashboard"></i> Dashboard
          </a>
          <a (click)="setTab('events')" [class.active]="activeTab === 'events'">
            <i class="icon-events"></i> Manage Events
          </a>
          <a (click)="setTab('blockchain')" [class.active]="activeTab === 'blockchain'">
            <i class="icon-blockchain"></i> Security Ledger
          </a>
          <a (click)="setTab('create')" [class.active]="activeTab === 'create'">
            <i class="icon-plus"></i> Create Event
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">{{ authService.currentUserValue?.username?.charAt(0).toUpperCase() }}</div>
            <div class="details">
              <span class="name">{{ authService.currentUserValue?.username }}</span>
              <span class="role">Administrator</span>
            </div>
          </div>
          <button class="logout-btn" (click)="authService.logout()">
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <span class="breadcrumb">Overview / Dashboard</span>
            <h1>{{ getTabTitle() }}</h1>
          </div>
          <div class="header-right">
            <div class="date-picker">
              <span>May 11, 2026</span>
            </div>
          </div>
        </header>

        <div class="content-body">
          <!-- Stats Dashboard -->
          <div *ngIf="activeTab === 'stats'" class="stats-container">
            <!-- Metric Cards -->
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-icon blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div class="metric-data">
                  <span class="label">Total Users</span>
                  <span class="value">{{ stats?.totalUsers || 0 }}</span>
                  <span class="trend positive">+12% from last month</span>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                </div>
                <div class="metric-data">
                  <span class="label">Active Events</span>
                  <span class="value">{{ stats?.totalEvents || 0 }}</span>
                  <span class="trend">Current scheduled</span>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0M2 9.5h20"></path></svg>
                </div>
                <div class="metric-data">
                  <span class="label">Tickets Sold</span>
                  <span class="value">{{ stats?.totalTicketsSold || 0 }}</span>
                  <span class="trend positive">+5% increase</span>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div class="metric-data">
                  <span class="label">Total Revenue</span>
                  <span class="value">{{ stats?.totalRevenue | currency }}</span>
                  <span class="trend positive">Target achieved</span>
                </div>
              </div>
            </div>

            <!-- Charts Row -->
            <div class="charts-grid">
              <div class="chart-card large">
                <h3>Sales Performance</h3>
                <div class="chart-container">
                  <canvas #salesChart></canvas>
                </div>
              </div>
              <div class="chart-card small">
                <h3>Ticket Distribution</h3>
                <div class="chart-container">
                  <canvas #distributionChart></canvas>
                </div>
              </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="recent-activity-card">
              <div class="card-header">
                <h3>Recent Ticket Transactions</h3>
                <button class="btn-text">View All</button>
              </div>
              <div class="table-wrapper">
                <table class="activity-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Event</th>
                      <th>Buyer</th>
                      <th>Seat</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ticket of stats?.recentTickets">
                      <td><span class="id-badge">#{{ ticket.id }}</span></td>
                      <td><strong>{{ ticket.event_name }}</strong></td>
                      <td>{{ ticket.owner_name || ticket.user_name || 'Guest' }}</td>
                      <td>{{ ticket.seat_label }}</td>
                      <td>{{ ticket.purchase_time | date:'short' }}</td>
                      <td>
                        <span class="status-pill" [class]="ticket.status.toLowerCase()">
                          {{ ticket.status }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="!stats?.recentTickets?.length">
                      <td colspan="6" class="empty-msg">No recent transactions found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Blockchain View -->
          <div *ngIf="activeTab === 'blockchain'" class="blockchain-container">
            <div class="ledger-header">
              <div class="ledger-info">
                <h3>Immutable Security Ledger</h3>
                <p>Real-time blockchain verification of all ticketing operations.</p>
              </div>
              <div class="ledger-status" [class.valid]="isChainValid">
                <div class="status-icon"></div>
                <span>{{ isChainValid ? 'Chain Verified' : 'Security Warning' }}</span>
              </div>
            </div>
            <div class="ledger-metrics">
              <div class="ledger-metric primary">
                <span class="label">Total Blocks</span>
                <span class="value">{{ blockchainSummary.totalBlocks }}</span>
                <span class="meta">Last hash {{ blockchainSummary.lastHash | slice:0:12 }}...</span>
              </div>
              <div class="ledger-metric">
                <span class="label">Last Action</span>
                <span class="value">{{ blockchainSummary.lastAction }}</span>
                <span class="meta">{{ blockchainSummary.lastTimestamp | date:'short' }}</span>
              </div>
              <div class="ledger-metric accent">
                <span class="label">Integrity</span>
                <span class="value">{{ isChainValid ? 'Verified' : 'Check' }}</span>
                <span class="meta">{{ isChainValid ? 'All links match' : 'Audit required' }}</span>
              </div>
            </div>
            <div class="ledger-charts">
              <div class="ledger-chart-card">
                <div class="chart-head">
                  <h4>Block Activity</h4>
                  <span>Daily additions</span>
                </div>
                <div class="chart-container compact">
                  <canvas #ledgerTimelineChart></canvas>
                </div>
              </div>
              <div class="ledger-chart-card">
                <div class="chart-head">
                  <h4>Action Breakdown</h4>
                  <span>Distribution by type</span>
                </div>
                <div class="chart-container compact">
                  <canvas #ledgerActionChart></canvas>
                </div>
              </div>
            </div>
            <div class="blocks-timeline">
              <div *ngIf="!blockchain.length" class="ledger-empty">
                No blockchain entries yet. Sell or validate a ticket to create the first block.
              </div>
              <div *ngFor="let block of blockchain" class="timeline-block">
                <div class="block-point"></div>
                <div class="block-content">
                  <div class="block-meta">
                    <span class="block-num">BLOCK #{{ block.index }}</span>
                    <span class="block-time">{{ block.timestamp | date:'medium' }}</span>
                  </div>
                  <div class="block-data">
                    <div class="action-tag">{{ block.data.action }}</div>
                    <p *ngIf="block.data.ticketId">Secured Ticket ID: <strong>{{ block.data.ticketId }}</strong></p>
                    <div class="hash-box">
                      <label>HASH</label>
                      <code>{{ block.hash }}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Events Management -->
          <div *ngIf="activeTab === 'events'" class="events-container">
            <div class="card">
              <div class="table-wrapper">
                <table class="premium-table">
                  <thead>
                    <tr>
                      <th>Event Details</th>
                      <th>Artist</th>
                      <th>Venue</th>
                      <th>Date & Time</th>
                      <th>Revenue</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let event of events">
                      <td>
                        <div class="event-info-cell">
                          <span class="event-name">{{ event.name }}</span>
                          <span class="event-id">ID: {{ event.id }}</span>
                        </div>
                      </td>
                      <td>{{ event.artist }}</td>
                      <td>{{ event.venue }}</td>
                      <td>
                        <div class="date-cell">
                          <span>{{ event.start_time | date:'mediumDate' }}</span>
                          <span class="sub">{{ event.start_time | date:'shortTime' }}</span>
                        </div>
                      </td>
                      <td><strong>{{ (event.price || 50) | currency }}</strong></td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="65"></div>
                        </div>
                        <span class="progress-text">65% Sold</span>
                      </td>
                      <td class="actions">
                        <button class="icon-btn view" (click)="viewSeats(event)" title="View Seats">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="icon-btn edit" (click)="editEvent(event)" title="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-btn delete" (click)="deleteEvent(event.id)" title="Delete">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Create/Edit Form -->
          <div *ngIf="activeTab === 'create' || activeTab === 'edit'" class="form-container">
            <div class="form-card">
              <div class="form-header">
                <h3>{{ activeTab === 'edit' ? 'Update Event Details' : 'Configure New Event' }}</h3>
                <p>Provide the essential details for the concert and seat configuration.</p>
              </div>
              <form (ngSubmit)="activeTab === 'edit' ? onUpdateEvent() : onCreateEvent()">
                <div class="form-grid">
                  <div class="form-group full">
                    <label>Event Name</label>
                    <input type="text" name="name" [(ngModel)]="newEvent.name" required placeholder="e.g. Symphony of Dreams">
                  </div>
                  <div class="form-group">
                    <label>Artist / Performer</label>
                    <input type="text" name="artist" [(ngModel)]="newEvent.artist" required placeholder="e.g. Hans Zimmer">
                  </div>
                  <div class="form-group">
                    <label>Ticket Price ($)</label>
                    <input type="number" name="price" [(ngModel)]="newEvent.price" required step="0.01">
                  </div>
                  <div class="form-group full">
                    <label>Description</label>
                    <textarea name="description" [(ngModel)]="newEvent.description" placeholder="Describe the event experience..."></textarea>
                  </div>
                  <div class="form-group">
                    <label>Venue Name</label>
                    <input type="text" name="venue" [(ngModel)]="newEvent.venue" required placeholder="e.g. Grand Arena">
                  </div>
                  <div class="form-group">
                    <label>Event Start</label>
                    <input type="datetime-local" name="startTime" [(ngModel)]="newEvent.startTime" required>
                  </div>
                  <div class="form-group" *ngIf="activeTab === 'create'">
                    <label>Seating Layout (Rows)</label>
                    <input type="number" name="rows" [(ngModel)]="newEvent.rows" required min="1">
                  </div>
                  <div class="form-group" *ngIf="activeTab === 'create'">
                    <label>Seats Per Row</label>
                    <input type="number" name="seatsPerRow" [(ngModel)]="newEvent.seatsPerRow" required min="1">
                  </div>
                </div>

                <div class="form-footer">
                  <button type="button" class="btn-secondary" (click)="setTab('events')">Discard Changes</button>
                  <button type="submit" class="btn-primary">
                    {{ activeTab === 'edit' ? 'Save Changes' : 'Launch Event' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Seat Map View (Overlay) -->
          <div *ngIf="viewingSeats" class="modal-overlay" (click)="viewingSeats = false">
            <div class="modal-window" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <h3>Interactive Seat Map</h3>
                  <p>{{ selectedEvent?.name }} - {{ selectedEvent?.venue }}</p>
                </div>
                <button class="close-modal" (click)="viewingSeats = false">&times;</button>
              </div>
              <div class="modal-body">
                <div class="stage-indicator">STAGE</div>
                <div class="seat-map-scroll">
                  <div class="seat-grid">
                    <div *ngFor="let seat of currentSeats" 
                         class="seat-item" 
                         [class.sold]="seat.ticket_status"
                         [title]="seat.seat_label + (seat.owner_name ? ' - Sold to ' + seat.owner_name : ' - Available')">
                    </div>
                  </div>
                </div>
                <div class="map-legend">
                  <div class="legend-pill"><span class="dot avail"></span> Available</div>
                  <div class="legend-pill"><span class="dot sold"></span> Sold / Reserved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
    :host { --primary: #6366f1; --primary-hover: #4f46e5; --bg: #f8fafc; --sidebar: #0f172a; --text-main: #1e293b; --text-muted: #64748b; --border: #e2e8f0; --white: #ffffff; }

    .admin-layout { display: flex; height: 100vh; background: var(--bg); color: var(--text-main); font-family: 'Space Grotesk', sans-serif; overflow: hidden; }
    
    /* Sidebar */
    .sidebar { width: 280px; background: var(--sidebar); color: #94a3b8; display: flex; flex-direction: column; z-index: 100; box-shadow: 4px 0 20px rgba(0,0,0,0.1); }
    .sidebar-header { padding: 40px 30px; }
    .logo { font-size: 26px; font-weight: 800; color: white; letter-spacing: -1px; }
    .logo span { color: var(--primary); }
    
    .sidebar-nav { flex: 1; padding: 0 15px; }
    .sidebar-nav a { 
      display: flex; align-items: center; padding: 14px 20px; color: #94a3b8; text-decoration: none; 
      margin-bottom: 8px; border-radius: 12px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; font-weight: 500;
    }
    .sidebar-nav a:hover { background: rgba(255,255,255,0.05); color: white; }
    .sidebar-nav a.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    
    .sidebar-footer { padding: 30px 20px; border-top: 1px solid rgba(255,255,255,0.05); }
    .user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .avatar { width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .details { display: flex; flex-direction: column; }
    .details .name { color: white; font-weight: 600; font-size: 14px; }
    .details .role { font-size: 12px; color: #64748b; }
    .logout-btn { 
      width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); 
      background: transparent; color: #ef4444; cursor: pointer; font-weight: 600; transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

    /* Main Content */
    .main-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .top-header { 
      padding: 30px 40px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); 
      display: flex; justify-content: space-between; align-items: flex-end; sticky: top; z-index: 50;
    }
    .breadcrumb { font-size: 12px; color: var(--text-muted); font-weight: 500; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .top-header h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -1px; }
    .date-picker { background: var(--white); padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); font-size: 14px; font-weight: 600; color: var(--text-muted); }

    .content-body { padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; }
    
    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .metric-card { 
      background: var(--white); padding: 24px; border-radius: 20px; display: flex; align-items: flex-start; gap: 20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid var(--border);
    }
    .metric-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .metric-icon.blue { background: #eff6ff; color: #3b82f6; }
    .metric-icon.purple { background: #f5f3ff; color: #8b5cf6; }
    .metric-icon.orange { background: #fff7ed; color: #f97316; }
    .metric-icon.green { background: #f0fdf4; color: #22c55e; }
    
    .metric-data .label { color: var(--text-muted); font-size: 14px; font-weight: 500; }
    .metric-data .value { display: block; font-size: 28px; font-weight: 800; color: #0f172a; margin: 4px 0; }
    .trend { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .trend.positive { color: #10b981; }
    
    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 40px; }
    .chart-card { background: var(--white); padding: 30px; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .chart-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 25px; }
    .chart-container { position: relative; height: 300px; }

    /* Tables */
    .recent-activity-card { background: var(--white); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; }
    .card-header { padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
    .card-header h3 { font-size: 18px; font-weight: 700; margin: 0; }
    .btn-text { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; }
    
    .table-wrapper { width: 100%; overflow-x: auto; }
    .activity-table, .premium-table { width: 100%; border-collapse: collapse; }
    .activity-table th, .premium-table th { padding: 18px 30px; text-align: left; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; background: #fcfdfe; }
    .activity-table td, .premium-table td { padding: 20px 30px; border-bottom: 1px solid var(--border); font-size: 14px; }
    .id-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-weight: 600; color: #475569; }
    
    .status-pill { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
    .status-pill.valid { background: #dcfce7; color: #15803d; }
    .status-pill.used { background: #f1f5f9; color: #475569; }
    .status-pill.cancelled { background: #fee2e2; color: #b91c1c; }

    .event-info-cell .event-name { display: block; font-weight: 700; font-size: 15px; color: #0f172a; }
    .event-info-cell .event-id { font-size: 12px; color: var(--text-muted); }
    .progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 4px; width: 100px; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 4px; }
    .progress-text { font-size: 11px; font-weight: 600; color: var(--text-muted); }

    .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: var(--text-muted); }
    .icon-btn:hover { background: #f8fafc; transform: translateY(-2px); }
    .icon-btn.view { color: #3b82f6; }
    .icon-btn.edit { color: #8b5cf6; }
    .icon-btn.delete { color: #ef4444; }

    /* Blockchain View */
    .blockchain-container { max-width: 1050px; margin: 0 auto; }
    .ledger-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: white; padding: 30px; border-radius: 24px; border: 1px solid var(--border); }
    .ledger-status { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-radius: 100px; background: #fee2e2; color: #b91c1c; font-weight: 700; }
    .ledger-status.valid { background: #dcfce7; color: #15803d; }
    .status-icon { width: 12px; height: 12px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }

    .ledger-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 24px; }
    .ledger-metric { background: white; padding: 20px; border-radius: 18px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
    .ledger-metric.primary { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(14,165,233,0.08)); border-color: rgba(99,102,241,0.2); }
    .ledger-metric.accent { background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(16,185,129,0.08)); border-color: rgba(34,197,94,0.2); }
    .ledger-metric .label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .ledger-metric .value { display: block; font-size: 22px; font-weight: 800; margin: 8px 0; color: #0f172a; }
    .ledger-metric .meta { font-size: 12px; color: var(--text-muted); }

    .ledger-charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .ledger-chart-card { background: white; border-radius: 20px; border: 1px solid var(--border); padding: 20px; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06); }
    .chart-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .chart-head h4 { margin: 0; font-size: 16px; font-weight: 800; }
    .chart-head span { font-size: 12px; color: var(--text-muted); }
    .chart-container.compact { height: 220px; }

    .ledger-empty { padding: 18px 24px; border-radius: 16px; border: 1px dashed var(--border); color: var(--text-muted); background: #f8fafc; font-weight: 600; }
    
    .blocks-timeline { display: flex; flex-direction: column; gap: 20px; }
    .timeline-block { display: flex; gap: 30px; position: relative; }
    .block-point { width: 24px; height: 24px; background: var(--white); border: 4px solid var(--primary); border-radius: 50%; z-index: 2; flex-shrink: 0; margin-top: 20px; }
    .timeline-block:not(:last-child)::after { content: ''; position: absolute; left: 10px; top: 40px; bottom: -20px; width: 4px; background: var(--border); }
    .block-content { flex: 1; background: var(--white); padding: 24px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .block-meta { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .block-num { font-weight: 800; font-size: 12px; color: var(--primary); letter-spacing: 1px; }
    .block-time { font-size: 12px; color: var(--text-muted); }
    .action-tag { background: #f8fafc; border: 1px solid var(--border); padding: 4px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; display: inline-block; margin-bottom: 12px; color: #0f172a; }
    .hash-box { background: #0f172a; color: #94a3b8; padding: 15px; border-radius: 12px; margin-top: 15px; }
    .hash-box label { font-size: 10px; font-weight: 800; display: block; margin-bottom: 5px; color: #475569; }
    .hash-box code { font-family: 'Fira Code', monospace; font-size: 12px; word-break: break-all; }

    /* Form Styles */
    .form-card { background: white; border-radius: 24px; border: 1px solid var(--border); padding: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
    .form-header { margin-bottom: 35px; }
    .form-header h3 { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
    .form-header p { color: var(--text-muted); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #334155; }
    .form-group input, .form-group textarea { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); font-size: 15px; transition: all 0.2s; background: #fcfdfe; }
    .form-group input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    .form-footer { margin-top: 40px; display: flex; justify-content: flex-end; gap: 15px; padding-top: 30px; border-top: 1px solid var(--border); }
    .btn-primary { background: var(--primary); color: white; padding: 14px 30px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
    .btn-secondary { background: #f1f5f9; color: #475569; padding: 14px 30px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-window { background: var(--white); width: 900px; border-radius: 28px; overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .modal-header { padding: 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 22px; font-weight: 800; }
    .close-modal { font-size: 28px; background: none; border: none; cursor: pointer; color: var(--text-muted); }
    .modal-body { padding: 40px; background: #fcfdfe; }
    .stage-indicator { background: #e2e8f0; color: #64748b; text-align: center; padding: 15px; border-radius: 12px; font-weight: 800; letter-spacing: 5px; margin-bottom: 40px; }
    .seat-map-scroll { max-height: 400px; overflow-y: auto; padding: 10px; }
    .seat-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .seat-item { width: 14px; height: 14px; border-radius: 4px; background: #d1d5db; transition: all 0.2s; cursor: help; }
    .seat-item.sold { background: #ef4444; }
    .map-legend { display: flex; justify-content: center; gap: 30px; margin-top: 40px; }
    .legend-pill { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; color: var(--text-muted); }
    .dot { width: 12px; height: 12px; border-radius: 3px; }
    .dot.avail { background: #d1d5db; }
    .dot.sold { background: #ef4444; }

    @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;
  @ViewChild('distributionChart') distributionChartCanvas!: ElementRef;
  @ViewChild('ledgerTimelineChart') ledgerTimelineChartCanvas!: ElementRef;
  @ViewChild('ledgerActionChart') ledgerActionChartCanvas!: ElementRef;

  activeTab: 'stats' | 'events' | 'blockchain' | 'create' | 'edit' = 'stats';
  events: any[] = [];
  stats: any = null;
  blockchain: any[] = [];
  isChainValid = true;
  selectedEvent: any = null;
  selectedEventId: number | null = null;
  viewingSeats = false;
  currentSeats: any[] = [];
  
  salesChart: any;
  distributionChart: any;
  ledgerTimelineChart: any;
  ledgerActionChart: any;
  blockchainSummary = {
    totalBlocks: 0,
    lastAction: '-',
    lastTimestamp: null,
    lastHash: '-'
  };

  newEvent = {
    name: '', artist: '', venue: '', description: '', price: 50,
    startTime: '', endTime: '', rows: 10, seatsPerRow: 10, capacity: 100
  };

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit() {
    this.loadEvents();
    this.loadStats();
    this.loadBlockchain();
  }

  ngAfterViewInit() {
    // We'll initialize charts once stats are loaded
  }

  setTab(tab: any) {
    this.activeTab = tab;
    if (tab === 'stats') {
      this.loadStats();
    }
  }

  getTabTitle() {
    switch(this.activeTab) {
      case 'stats': return 'System Performance';
      case 'events': return 'Inventory Management';
      case 'blockchain': return 'Security Logs';
      case 'create': return 'New Concert Creation';
      case 'edit': return 'Modify Event';
      default: return 'Admin Hub';
    }
  }

  loadEvents() {
    this.http.get<any>(`${environment.apiUrl}/concerts`).subscribe(res => {
      this.events = res.data;
    });
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/concerts/stats`, { headers: this.getHeaders() }).subscribe(res => {
      this.stats = res.data;
      setTimeout(() => this.initCharts(), 100);
    });
  }

  initCharts() {
    if (this.salesChart) this.salesChart.destroy();
    if (this.distributionChart) this.distributionChart.destroy();

    // Sales Trend Chart
    const salesCtx = this.salesChartCanvas?.nativeElement.getContext('2d');
    if (salesCtx) {
      const labels = this.stats.salesOverTime?.map((d: any) => new Date(d.date).toLocaleDateString()) || [];
      const data = this.stats.salesOverTime?.map((d: any) => d.count) || [];

      this.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Tickets Sold',
            data: data.length ? data : [12, 19, 3, 5, 2, 3, 7],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Distribution Chart
    const distCtx = this.distributionChartCanvas?.nativeElement.getContext('2d');
    if (distCtx) {
      const statusData = this.stats.statusStats || [];
      const labels = statusData.map((s: any) => s.status);
      const data = statusData.map((s: any) => parseInt(s.count));

      this.distributionChart = new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['VALID', 'USED', 'CANCELLED'],
          datasets: [{
            data: data.length ? data : [80, 15, 5],
            backgroundColor: ['#6366f1', '#94a3b8', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
          }
        }
      });
    }
  }

  loadBlockchain() {
    this.http.get<any>(`${environment.apiUrl}/blockchain`).subscribe(res => {
      this.blockchain = res.data.reverse();
      this.updateBlockchainSummary();
      setTimeout(() => this.initBlockchainCharts(), 100);
    });
    this.http.get<any>(`${environment.apiUrl}/blockchain/validate`).subscribe(res => {
      this.isChainValid = res.valid;
    });
  }

  updateBlockchainSummary() {
    const latest = this.blockchain[0];
    this.blockchainSummary = {
      totalBlocks: this.blockchain.length,
      lastAction: latest?.data?.action || '-',
      lastTimestamp: latest?.timestamp || null,
      lastHash: latest?.hash || '-'
    };
  }

  initBlockchainCharts() {
    if (this.ledgerTimelineChart) this.ledgerTimelineChart.destroy();
    if (this.ledgerActionChart) this.ledgerActionChart.destroy();

    const timelineCtx = this.ledgerTimelineChartCanvas?.nativeElement.getContext('2d');
    if (timelineCtx) {
      const orderedBlocks = [...this.blockchain].reverse();
      const buckets: Record<string, number> = {};
      orderedBlocks.forEach((block: any) => {
        const date = new Date(block.timestamp);
        if (Number.isNaN(date.getTime())) return;
        const key = date.toISOString().slice(0, 10);
        buckets[key] = (buckets[key] || 0) + 1;
      });

      let labels = Object.keys(buckets);
      let values = labels.map((label) => buckets[label]);

      if (!labels.length) {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        values = [0, 0, 0, 0, 0, 0, 0];
      } else {
        labels = labels.map((label) => new Date(label).toLocaleDateString());
      }

      this.ledgerTimelineChart = new Chart(timelineCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Blocks',
            data: values,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const actionCtx = this.ledgerActionChartCanvas?.nativeElement.getContext('2d');
    if (actionCtx) {
      const actionCounts: Record<string, number> = {};
      this.blockchain.forEach((block: any) => {
        const action = block?.data?.action || 'UNKNOWN';
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });

      const labels = Object.keys(actionCounts);
      const data = labels.map((label) => actionCounts[label]);
      const chartLabels = labels.length ? labels : ['SOLD', 'USED', 'CANCELLED'];
      const chartData = data.length ? data : [0, 0, 0];

      this.ledgerActionChart = new Chart(actionCtx, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: ['#6366f1', '#0ea5e9', '#f97316', '#22c55e'],
            borderRadius: 8,
            maxBarThickness: 48
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }

  viewSeats(event: any) {
    this.selectedEvent = event;
    this.http.get<any>(`${environment.apiUrl}/concerts/${event.id}/seats`).subscribe(res => {
      this.currentSeats = res.data;
      this.viewingSeats = true;
    });
  }

  private getHeaders() {
    return { 'Authorization': `Bearer ${this.authService.getToken()}` };
  }

  onCreateEvent() {
    this.newEvent.capacity = this.newEvent.rows * this.newEvent.seatsPerRow;
    this.http.post(`${environment.apiUrl}/concerts`, this.newEvent, { headers: this.getHeaders() }).subscribe(() => {
      this.loadEvents();
      this.loadStats();
      this.activeTab = 'events';
      this.resetForm();
    });
  }

  editEvent(event: any) {
    this.selectedEventId = event.id;
    this.newEvent = {
      ...event,
      price: event.price || 50,
      startTime: this.formatDateForInput(event.start_time),
      endTime: this.formatDateForInput(event.end_time)
    };
    this.activeTab = 'edit';
  }

  onUpdateEvent() {
    if (!this.selectedEventId) return;
    this.http.put(`${environment.apiUrl}/concerts/${this.selectedEventId}`, this.newEvent, { headers: this.getHeaders() }).subscribe(() => {
      this.loadEvents();
      this.activeTab = 'events';
      this.resetForm();
    });
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event? This action is permanent and will remove all linked data.')) {
      this.http.delete(`${environment.apiUrl}/concerts/${id}`, { headers: this.getHeaders() }).subscribe(() => {
        this.loadEvents();
        this.loadStats();
      });
    }
  }

  private formatDateForInput(dateStr: string) {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  }

  resetForm() {
    this.newEvent = {
      name: '', artist: '', venue: '', description: '', price: 50,
      startTime: '', endTime: '', rows: 10, seatsPerRow: 10, capacity: 100
    };
    this.selectedEventId = null;
  }
}
