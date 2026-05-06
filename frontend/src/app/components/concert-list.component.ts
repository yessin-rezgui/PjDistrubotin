import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';

@Component({
  selector: 'app-concert-list',
  standalone: true,
  imports: [CommonModule, TicketDetailsComponent],
  template: `
    <div class="container">
      <h1>Live Concert Events</h1>
      
      <div class="concerts-grid" *ngIf="!selectedConcert">
        <div class="concert-card" *ngFor="let concert of concerts">
          <div class="concert-header">
            <h3>{{ concert.name }}</h3>
            <span class="artist">{{ concert.artist }}</span>
          </div>
          <div class="concert-info">
            <p>📍 {{ concert.venue }}</p>
            <p>📅 {{ concert.start_time | date:'medium' }}</p>
          </div>
          <button class="btn-select" (click)="selectConcert(concert)">Select Seats</button>
        </div>
      </div>

      <div class="seat-selection" *ngIf="selectedConcert && !purchasedTicket">
        <div class="selection-header">
          <button class="btn-back" (click)="selectedConcert = null">← Back to Events</button>
          <h2>{{ selectedConcert.name }} - Seat Selection</h2>
        </div>

        <div class="seat-map">
          <div class="screen">STAGE</div>
          <div class="seats-container">
            <div class="seat" 
                 *ngFor="let seat of seats"
                 [class.sold]="seat.status === 'SOLD'"
                 [class.selected]="selectedSeat === seat"
                 (click)="selectSeat(seat)">
              {{ seat.seat_label }}
            </div>
          </div>
        </div>

        <div class="booking-panel" *ngIf="selectedSeat">
          <p>Selected Seat: <strong>{{ selectedSeat.seat_label }}</strong></p>
          <button class="btn-buy" [disabled]="buying" (click)="buyTicket()">
            {{ buying ? 'Processing...' : 'Buy Ticket Now' }}
          </button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </div>
      </div>

      <div class="success-screen" *ngIf="purchasedTicket">
        <h2>🎉 Congratulations!</h2>
        <p>Your ticket has been confirmed.</p>
        <app-ticket-details [ticket]="purchasedTicket"></app-ticket-details>
        
        <div class="success-actions">
          <button class="btn-download" (click)="downloadTicket()">Download Ticket (QR)</button>
          <button class="btn-back" (click)="reset()">Back to Events</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
    .concerts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .concert-card { background: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
    .artist { color: #6366f1; font-weight: 600; }
    .concert-info { margin: 1rem 0; font-size: 0.9rem; color: #666; }
    .btn-select { width: 100%; padding: 0.8rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
    
    .seat-map { margin: 2rem auto; max-width: 800px; text-align: center; }
    .screen { background: #e2e8f0; padding: 0.5rem; margin-bottom: 2rem; border-radius: 0.25rem; font-weight: 700; color: #64748b; }
    .seats-container { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .seat { 
      width: 40px; height: 40px; border: 1px solid #cbd5e1; border-radius: 4px;
      display: flex; align-items: center; justify-content: center; font-size: 0.7rem;
      cursor: pointer; transition: all 0.2s;
    }
    .seat:hover:not(.sold) { background: #e0e7ff; border-color: #6366f1; }
    .seat.selected { background: #6366f1; color: white; border-color: #6366f1; }
    .seat.sold { background: #f1f5f9; color: #cbd5e1; border-color: #e2e8f0; cursor: not-allowed; }
    
    .booking-panel { margin-top: 2rem; text-align: center; padding: 2rem; border: 1px solid #eee; border-radius: 1rem; }
    .btn-buy { background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; }
    .error { color: #ef4444; margin-top: 1rem; }
    .btn-back { background: none; border: none; color: #6366f1; cursor: pointer; font-weight: 600; margin-bottom: 1rem; }
    .success-actions { display: flex; flex-direction: column; gap: 1rem; align-items: center; margin-top: 2rem; }
    .btn-download { background: #6366f1; color: white; border: none; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; width: 300px; }
  `]
})
export class ConcertListComponent implements OnInit, OnDestroy {
  concerts: any[] = [];
  selectedConcert: any = null;
  seats: any[] = [];
  selectedSeat: any = null;
  socket: Socket | null = null;
  buying = false;
  purchasedTicket: any = null;
  error = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadConcerts();
    this.initSocket();
  }

  ngOnDestroy() {
    if (this.socket) this.socket.disconnect();
  }

  initSocket() {
    this.socket = io(environment.socketUrl);
    this.socket.on('seatUpdated', (data: any) => {
      if (this.selectedConcert && this.selectedConcert.id === data.concertId) {
        const seat = this.seats.find(s => s.seat_label === data.seatLabel);
        if (seat) seat.status = data.status;
        if (this.selectedSeat && this.selectedSeat.seat_label === data.seatLabel && data.status === 'SOLD') {
          this.selectedSeat = null;
          this.error = 'Someone else just bought this seat!';
        }
      }
    });
  }

  loadConcerts() {
    this.http.get<any>(`${environment.apiUrl}/concerts`).subscribe(res => {
      this.concerts = res.data;
    });
  }

  selectConcert(concert: any) {
    this.selectedConcert = concert;
    this.loadSeats(concert.id);
    if (this.socket) this.socket.emit('joinConcert', concert.id);
  }

  loadSeats(id: number) {
    this.http.get<any>(`${environment.apiUrl}/concerts/${id}/seats`).subscribe(res => {
      this.seats = res.data;
    });
  }

  selectSeat(seat: any) {
    if (seat.status !== 'AVAILABLE') return;
    this.selectedSeat = seat;
    this.error = '';
  }

  buyTicket() {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please login to buy tickets';
      return;
    }

    this.buying = true;
    this.error = '';
    
    const payload = {
      concertId: this.selectedConcert.id,
      seatLabel: this.selectedSeat.seat_label
    };

    const headers = { 'Authorization': `Bearer ${this.authService.getToken()}` };

    this.http.post<any>(`${environment.apiUrl}/tickets/buy`, payload, { headers }).subscribe({
      next: (res) => {
        this.purchasedTicket = {
          ...res.data,
          id: res.data.ticketId,
          concertName: this.selectedConcert.name,
          artist: this.selectedConcert.artist,
          venue: this.selectedConcert.venue,
          startTime: this.selectedConcert.start_time,
          status: 'VALID',
          seatLabel: this.selectedSeat.seat_label,
          ownerName: this.authService.currentUserValue?.username,
          hash: res.data.blockchainHash
        };
        this.buying = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to buy ticket';
        this.buying = false;
      }
    });
  }

  reset() {
    this.selectedConcert = null;
    this.purchasedTicket = null;
    this.selectedSeat = null;
    this.loadConcerts();
  }

  downloadTicket() {
    if (!this.purchasedTicket || !this.purchasedTicket.qrCode) return;
    
    const link = document.createElement('a');
    link.href = this.purchasedTicket.qrCode;
    link.download = `Ticket_${this.purchasedTicket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
