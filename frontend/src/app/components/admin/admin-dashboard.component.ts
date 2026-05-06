import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

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
          <a (click)="activeTab = 'stats'" [class.active]="activeTab === 'stats'">
            Dashboard
          </a>
          <a (click)="activeTab = 'events'" [class.active]="activeTab === 'events'">
            Events
          </a>
          <a (click)="activeTab = 'blockchain'" [class.active]="activeTab === 'blockchain'">
            Blockchain
          </a>
          <a (click)="activeTab = 'create'" [class.active]="activeTab === 'create'">
            Create Event
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-header">
          <h1>{{ getTabTitle() }}</h1>
          <div class="user-profile">
            <span>{{ authService.currentUserValue?.username }}</span>
            <button class="logout-btn" (click)="authService.logout()">Logout</button>
          </div>
        </header>

        <div class="content-body">
          <!-- Stats Dashboard -->
          <div *ngIf="activeTab === 'stats'" class="stats-grid">
            <div class="stat-card">
              <div class="stat-info">
                <span class="label">Total Events</span>
                <span class="value">{{ stats?.totalEvents || 0 }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="label">Tickets Sold</span>
                <span class="value">{{ stats?.totalTicketsSold || 0 }}</span>
              </div>
            </div>
            
            <div class="recent-activity full-width">
              <h3>Recent Ticket Sales</h3>
              <div class="activity-list">
                <div *ngFor="let ticket of stats?.recentTickets" class="activity-item">
                  <div class="ticket-info">
                    <strong>{{ ticket.event_name }}</strong>
                    <span>Sold to {{ ticket.user_name }}</span>
                  </div>
                  <div class="ticket-time">{{ ticket.purchase_time | date:'short' }}</div>
                </div>
                <div *ngIf="!stats?.recentTickets?.length" class="empty-state">No recent activity</div>
              </div>
            </div>
          </div>

          <!-- Blockchain View -->
          <div *ngIf="activeTab === 'blockchain'" class="blockchain-view">
            <div class="blockchain-header">
              <h3>Blockchain Explorer</h3>
              <span class="badge" [class.valid]="isChainValid">Verified & Immutable</span>
            </div>
            <div class="chain-list">
              <div *ngFor="let block of blockchain" class="block-card">
                <div class="block-header">
                  <span class="block-index">Block #{{ block.index }}</span>
                  <span class="block-hash">{{ block.hash.substring(0, 16) }}...</span>
                </div>
                <div class="block-body">
                  <div class="data-item"><strong>Action:</strong> {{ block.data.action }}</div>
                  <div class="data-item" *ngIf="block.data.ticketId"><strong>Ticket ID:</strong> {{ block.data.ticketId }}</div>
                  <div class="data-item"><strong>Time:</strong> {{ block.timestamp | date:'medium' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Events Management -->
          <div *ngIf="activeTab === 'events'" class="events-management">
            <div class="table-container">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Artist</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let event of events">
                    <td>
                      <div class="event-cell">
                        <strong>{{ event.name }}</strong>
                        <span>ID: #{{ event.id }}</span>
                      </div>
                    </td>
                    <td>{{ event.artist }}</td>
                    <td>{{ event.venue }}</td>
                    <td>{{ event.start_time | date:'mediumDate' }}</td>
                    <td>{{ event.capacity }}</td>
                    <td class="actions">
                      <button class="btn-view" (click)="viewSeats(event)">Seats</button>
                      <button class="btn-edit" (click)="editEvent(event)">Edit</button>
                      <button class="btn-delete" (click)="deleteEvent(event.id)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Seat Map View (Overlay) -->
          <div *ngIf="viewingSeats" class="modal-overlay" (click)="viewingSeats = false">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Seat Map: {{ selectedEvent?.name }}</h3>
              <div class="seat-legend">
                <span class="legend-item"><span class="box available"></span> Available</span>
                <span class="legend-item"><span class="box sold"></span> Sold</span>
              </div>
              <div class="seat-grid">
                <div *ngFor="let seat of currentSeats" 
                     class="seat-box" 
                     [class.sold]="seat.ticket_status"
                     [title]="seat.seat_label + (seat.owner_name ? ' - ' + seat.owner_name : '')">
                  {{ seat.seat_label }}
                </div>
              </div>
              <button class="btn-close" (click)="viewingSeats = false">Close</button>
            </div>
          </div>

          <!-- Create/Edit Form -->
          <div *ngIf="activeTab === 'create' || activeTab === 'edit'" class="form-container">
            <div class="form-card">
              <h3>{{ activeTab === 'edit' ? 'Edit' : 'Create' }} Concert</h3>
              <form (ngSubmit)="activeTab === 'edit' ? onUpdateEvent() : onCreateEvent()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Event Name</label>
                    <input type="text" name="name" [(ngModel)]="newEvent.name" required placeholder="e.g. Rock Night">
                  </div>
                  <div class="form-group">
                    <label>Artist</label>
                    <input type="text" name="artist" [(ngModel)]="newEvent.artist" required placeholder="e.g. Queen">
                  </div>
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea name="description" [(ngModel)]="newEvent.description" placeholder="Event description..."></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Venue</label>
                    <input type="text" name="venue" [(ngModel)]="newEvent.venue" required placeholder="e.g. Wembley Stadium">
                  </div>
                  <div class="form-group">
                    <label>Start Time</label>
                    <input type="datetime-local" name="startTime" [(ngModel)]="newEvent.startTime" required>
                  </div>
                  <div class="form-group">
                    <label>End Time</label>
                    <input type="datetime-local" name="endTime" [(ngModel)]="newEvent.endTime" required>
                  </div>
                </div>

                <div class="form-row" *ngIf="activeTab === 'create'">
                  <div class="form-group">
                    <label>Rows</label>
                    <input type="number" name="rows" [(ngModel)]="newEvent.rows" required min="1">
                  </div>
                  <div class="form-group">
                    <label>Seats Per Row</label>
                    <input type="number" name="seatsPerRow" [(ngModel)]="newEvent.seatsPerRow" required min="1">
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-cancel" (click)="activeTab = 'events'">Cancel</button>
                  <button type="submit" class="btn-submit">{{ activeTab === 'edit' ? 'Update' : 'Create' }} Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; height: 100vh; background: #f8fafc; }
    
    .sidebar { width: 260px; background: #1e293b; color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 24px; font-weight: 700; }
    .logo span { color: #6366f1; }
    
    .sidebar-nav { padding: 20px 0; flex: 1; }
    .sidebar-nav a { 
      display: flex; align-items: center; padding: 15px 30px; color: #94a3b8; text-decoration: none; 
      transition: all 0.3s; cursor: pointer; font-weight: 500;
    }
    .sidebar-nav a:hover { background: rgba(255,255,255,0.05); color: white; }
    .sidebar-nav a.active { background: #6366f1; color: white; }
    
    .main-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .top-header { 
      padding: 20px 40px; background: white; border-bottom: 1px solid #e2e8f0; 
      display: flex; justify-content: space-between; align-items: center;
    }
    .top-header h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
    
    .user-profile { display: flex; align-items: center; gap: 20px; }
    .logout-btn { 
      padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; 
      background: white; cursor: pointer; font-weight: 500; transition: all 0.3s;
    }
    .logout-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

    .content-body { padding: 40px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .stat-card { 
      background: white; padding: 30px; border-radius: 16px; display: flex; align-items: center; gap: 20px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .stat-info .label { display: block; color: #64748b; font-size: 14px; margin-bottom: 5px; }
    .stat-info .value { font-size: 28px; font-weight: 700; color: #1e293b; }
    
    .recent-activity { background: white; padding: 30px; border-radius: 16px; margin-top: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .full-width { grid-column: 1 / -1; }
    .activity-list { margin-top: 20px; }
    .activity-item { 
      display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f5f9;
    }
    
    .table-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: #f8fafc; padding: 15px 20px; text-align: left; font-weight: 600; color: #64748b; }
    .premium-table td { padding: 20px; border-bottom: 1px solid #f1f5f9; }
    .event-cell strong { display: block; color: #1e293b; }
    .event-cell span { font-size: 12px; color: #94a3b8; }
    
    .actions { display: flex; gap: 10px; }
    .btn-view { color: #10b981; background: #ecfdf5; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    .btn-edit { color: #6366f1; background: #eef2ff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    .btn-delete { color: #ef4444; background: #fef2f2; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 30px; border-radius: 16px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
    .seat-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 10px; margin-top: 20px; }
    .seat-box { width: 40px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; background: #f1f5f9; color: #64748b; }
    .seat-box.sold { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
    .seat-legend { display: flex; gap: 20px; margin-bottom: 20px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .box { width: 16px; height: 16px; border-radius: 4px; }
    .box.available { background: #f1f5f9; }
    .box.sold { background: #fee2e2; }

    .blockchain-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .chain-list { display: flex; flex-direction: column; gap: 15px; }
    .block-card { background: white; border-radius: 12px; border-left: 4px solid #6366f1; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .block-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .block-index { font-weight: 700; color: #1e293b; }
    .block-hash { font-family: monospace; color: #94a3b8; font-size: 12px; }
    .data-item { font-size: 14px; margin-bottom: 5px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge.valid { background: #dcfce7; color: #166534; }

    .form-card { background: white; padding: 40px; border-radius: 16px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .form-group label { font-weight: 600; color: #1e293b; font-size: 14px; }
    .form-group input, .form-group textarea { 
      padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 15px; 
    }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-submit { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'stats' | 'events' | 'blockchain' | 'create' | 'edit' = 'stats';
  events: any[] = [];
  stats: any = null;
  blockchain: any[] = [];
  isChainValid = true;
  selectedEvent: any = null;
  selectedEventId: number | null = null;
  viewingSeats = false;
  currentSeats: any[] = [];
  
  newEvent = {
    name: '', artist: '', venue: '', description: '',
    startTime: '', endTime: '', rows: 10, seatsPerRow: 10, capacity: 100
  };

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit() {
    this.loadEvents();
    this.loadStats();
    this.loadBlockchain();
  }

  getTabTitle() {
    switch(this.activeTab) {
      case 'stats': return 'Dashboard Overview';
      case 'events': return 'Manage Events';
      case 'blockchain': return 'Blockchain Ledger';
      case 'create': return 'Create New Event';
      case 'edit': return 'Edit Event';
      default: return 'Admin Dashboard';
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
    });
  }

  loadBlockchain() {
    this.http.get<any>(`${environment.apiUrl}/blockchain`).subscribe(res => {
      this.blockchain = res.data.reverse();
    });
    this.http.get<any>(`${environment.apiUrl}/blockchain/validate`).subscribe(res => {
      this.isChainValid = res.valid;
    });
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
    if (confirm('Are you sure you want to delete this event? All associated seats and tickets will be removed.')) {
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
      name: '', artist: '', venue: '', description: '',
      startTime: '', endTime: '', rows: 10, seatsPerRow: 10, capacity: 100
    };
    this.selectedEventId = null;
  }
}
