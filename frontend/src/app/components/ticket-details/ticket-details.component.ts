import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket-container" *ngIf="ticket">
      <div class="ticket">
        <!-- Left Side: Event Info -->
        <div class="ticket-left">
          <div class="event-tag">OFFICIAL TICKET</div>
          <h2 class="concert-name">{{ ticket.concertName }}</h2>
          <div class="artist-name">{{ ticket.artist }}</div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">DATE & TIME</span>
              <span class="value">{{ ticket.startTime | date:'medium' }}</span>
            </div>
            <div class="info-item">
              <span class="label">VENUE / STAGE</span>
              <span class="value">{{ ticket.venue }}</span>
            </div>
            <div class="info-item">
              <span class="label">SEAT</span>
              <span class="value highlight">{{ ticket.seatLabel }}</span>
            </div>
            <div class="info-item">
              <span class="label">HOLDER</span>
              <span class="value">{{ ticket.ownerName }}</span>
            </div>
          </div>

          <div class="blockchain-strip">
            <span class="label">BLOCKCHAIN PROOF</span>
            <span class="hash">{{ ticket.hash }}</span>
          </div>
        </div>

        <!-- Right Side: QR Code -->
        <div class="ticket-right">
          <div class="qr-container">
            <img [src]="ticket.qrCode" alt="QR Code">
          </div>
          <div class="ticket-id">#{{ ticket.id }}</div>
          <div class="status-badge" [class.valid]="ticket.status === 'VALID'">
            {{ ticket.status }}
          </div>
        </div>

        <!-- Decorative Elements -->
        <div class="cutout-top"></div>
        <div class="cutout-bottom"></div>
      </div>
    </div>
  `,
  styles: [`
    .ticket-container { padding: 20px; perspective: 1000px; }
    
    .ticket {
      display: flex;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 30px 60px -12px rgba(50,50,93,0.25), 0 18px 36px -18px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      min-height: 380px;
    }

    .ticket-left {
      flex: 1.5;
      padding: 40px;
      border-right: 2px dashed #e2e8f0;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }

    .event-tag {
      background: #6366f1;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 20px;
    }

    .concert-name { font-size: 32px; font-weight: 900; color: #1e293b; margin: 0; line-height: 1.1; }
    .artist-name { font-size: 18px; color: #6366f1; font-weight: 600; margin-top: 5px; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 40px; }
    .info-item .label { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; margin-bottom: 5px; letter-spacing: 0.5px; }
    .info-item .value { display: block; font-size: 15px; font-weight: 600; color: #334155; }
    .value.highlight { color: #6366f1; font-size: 20px; }

    .blockchain-strip { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .blockchain-strip .hash { font-family: monospace; font-size: 10px; color: #94a3b8; word-break: break-all; display: block; margin-top: 5px; }

    .ticket-right {
      flex: 0.8;
      background: #1e293b;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .qr-container { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
    .qr-container img { width: 140px; height: 140px; display: block; }
    
    .ticket-id { font-family: monospace; font-size: 14px; opacity: 0.6; margin-bottom: 15px; }
    
    .status-badge {
      background: rgba(255,255,255,0.1);
      padding: 6px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .status-badge.valid { background: #10b981; color: white; }

    /* Decorative circles for the ticket cut */
    .cutout-top, .cutout-bottom {
      position: absolute;
      left: 65.2%; /* Alignment with dashed line */
      width: 30px;
      height: 30px;
      background: #f1f5f9;
      border-radius: 50%;
      z-index: 5;
    }
    .cutout-top { top: -15px; }
    .cutout-bottom { bottom: -15px; }

    @media (max-width: 600px) {
      .ticket { flex-direction: column; }
      .ticket-left { border-right: none; border-bottom: 2px dashed #e2e8f0; }
      .cutout-top, .cutout-bottom { display: none; }
    }
  `]
})
export class TicketDetailsComponent {
  @Input() ticket: any;
}
