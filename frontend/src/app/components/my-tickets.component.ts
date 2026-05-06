import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, TicketDetailsComponent],
  template: `
    <div class="my-tickets-page">
      <div class="container">
        <header class="page-header">
          <h1>My Tickets</h1>
          <p>You have {{ tickets.length }} tickets in your collection</p>
        </header>

        <div class="tickets-grid" *ngIf="tickets.length > 0; else empty">
          <div class="ticket-wrapper" *ngFor="let ticket of tickets">
            <app-ticket-details [ticket]="ticket"></app-ticket-details>
            <div class="ticket-footer">
              <button class="btn-download" (click)="downloadTicket(ticket)">Download PNG</button>
            </div>
          </div>
        </div>

        <ng-template #empty>
          <div class="empty-state">
            <div class="empty-icon">🎟️</div>
            <h2>No tickets found</h2>
            <p>You haven't purchased any tickets yet.</p>
            <a routerLink="/events" class="btn-browse">Browse Events</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .my-tickets-page { padding: 60px 20px; background: #f1f5f9; min-height: 90vh; }
    .container { max-width: 1200px; margin: 0 auto; }
    
    .page-header { text-align: center; margin-bottom: 50px; }
    .page-header h1 { font-size: 36px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
    .page-header p { color: #64748b; font-size: 18px; }

    .tickets-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
      gap: 40px; 
      justify-items: center;
    }
    
    .ticket-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; }
    .ticket-footer { margin-top: -10px; z-index: 2; }
    .btn-download { 
      background: #1e293b; color: white; border: none; padding: 10px 25px; 
      border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .btn-download:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .empty-state { text-align: center; padding: 100px 20px; background: white; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .empty-icon { font-size: 64px; margin-bottom: 20px; }
    .empty-state h2 { font-size: 24px; color: #1e293b; margin-bottom: 10px; }
    .empty-state p { color: #64748b; margin-bottom: 30px; }
    .btn-browse { 
      display: inline-block; background: #6366f1; color: white; padding: 12px 30px; 
      border-radius: 12px; text-decoration: none; font-weight: 700; 
    }
  `]
})
export class MyTicketsComponent implements OnInit {
  tickets: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    const headers = { 'Authorization': `Bearer ${this.authService.getToken()}` };
    this.http.get<any>(`${environment.apiUrl}/tickets/my-tickets`, { headers }).subscribe({
      next: (res) => {
        this.tickets = res.data;
      },
      error: (err) => console.error('Error loading tickets', err)
    });
  }

  downloadTicket(ticket: any) {
    if (!ticket.qrCode) return;
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `Ticket_${ticket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
