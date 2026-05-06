import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket-card" *ngIf="ticket">
      <h3>Ticket Confirmation</h3>
      <div class="ticket-info">
        <p><strong>Event:</strong> {{ ticket.concertName }}</p>
        <p><strong>Seat:</strong> {{ ticket.seatLabel }}</p>
        <p><strong>Holder:</strong> {{ ticket.ownerName }}</p>
      </div>
      <div class="qr-section">
        <img [src]="ticket.qrCode" alt="QR Code">
        <p class="id">Ticket ID: {{ ticket.id }}</p>
      </div>
      <div class="blockchain">
        <small>Blockchain Proof: {{ ticket.hash }}</small>
      </div>
    </div>
  `,
  styles: [`
    .ticket-card { border: 2px solid #333; padding: 20px; border-radius: 10px; background: white; color: black; max-width: 400px; margin: 20px auto; }
    .qr-section img { width: 150px; }
    .blockchain { margin-top: 10px; word-break: break-all; color: #666; font-size: 0.8em; }
  `]
})
export class TicketDetailsComponent {
  @Input() ticket: any;
}
