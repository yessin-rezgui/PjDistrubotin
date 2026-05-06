import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scanner-page">
      <div class="scanner-card">
        <div class="scanner-header">
          <h2>Entrance Validator</h2>
          <p>Scan ticket QR code for instant entry verification</p>
        </div>

        <div class="scanner-body">
          <div id="reader"></div>
          
          <div class="manual-input">
            <span class="divider">OR ENTER MANUALLY</span>
            <div class="input-group">
              <input type="text" [(ngModel)]="manualTicketId" placeholder="Ticket ID (e.g. 101)">
              <button (click)="validateTicket(manualTicketId)" [disabled]="validating">Validate</button>
            </div>
          </div>
        </div>

        <!-- Toast Notification -->
        <div class="toast" *ngIf="showToast" [class.success]="result?.success" [class.error]="!result?.success">
          {{ result?.message }}
        </div>

        <!-- Result Overlay -->
        <div class="result-overlay" *ngIf="result" [class.success]="result.success" [class.error]="!result.success">
          <div class="result-content">
            <div class="result-icon">
              <span *ngIf="result.success">✓</span>
              <span *ngIf="!result.success">✕</span>
            </div>
            <h3>{{ result.success ? 'ACCESS GRANTED' : 'ACCESS DENIED' }}</h3>
            <p>{{ result.message }}</p>
            <button (click)="resetScanner()">Scan Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scanner-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: #f1f5f9;
      padding: 20px;
    }
    .scanner-card {
      width: 100%;
      max-width: 500px;
      background: white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    .scanner-header { text-align: center; margin-bottom: 30px; }
    .scanner-header h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
    .scanner-header p { color: #64748b; font-size: 14px; }

    #reader {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      border: none !important;
    }

    .manual-input { margin-top: 30px; text-align: center; }
    .divider { display: block; font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 20px; }
    .input-group { display: flex; gap: 10px; }
    .input-group input { 
      flex: 1; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px;
    }
    .input-group button {
      padding: 12px 24px; background: #1e293b; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;
    }

    /* Result Overlay */
    .result-overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10;
      animation: fadeIn 0.3s ease;
    }
    .result-overlay.success { background: rgba(16, 185, 129, 0.95); color: white; }
    .result-overlay.error { background: rgba(239, 68, 68, 0.95); color: white; }
    
    .result-content { text-align: center; padding: 40px; }
    .result-icon { 
      font-size: 60px; font-weight: 300; width: 100px; height: 100px; border: 4px solid white; 
      border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    }
    .result-content h3 { font-size: 32px; font-weight: 800; margin-bottom: 10px; letter-spacing: 2px; }
    .result-content p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }
    .result-content button { 
      padding: 12px 40px; background: white; color: #1e293b; border: none; border-radius: 12px; 
      font-weight: 700; cursor: pointer; transition: transform 0.2s;
    }
    .result-content button:hover { transform: scale(1.05); }

    .toast {
      position: fixed; top: 20px; right: 20px; padding: 15px 30px; border-radius: 12px;
      color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    }
    .toast.success { background: #10b981; }
    .toast.error { background: #ef4444; }

    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ScannerComponent implements OnInit, OnDestroy {
  manualTicketId: string = '';
  validating = false;
  result: any = null;
  scanner: any = null;
  showToast = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initScanner();
  }

  ngOnDestroy() {
    if (this.scanner) {
      this.scanner.clear();
    }
  }

  initScanner() {
    this.scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    this.scanner.render(this.onScanSuccess.bind(this), this.onScanFailure.bind(this));
  }

  onScanSuccess(decodedText: string) {
    try {
      // Assuming QR contains JSON { ticketId: ... }
      const data = JSON.parse(decodedText);
      this.validateTicket(data.ticketId);
    } catch (e) {
      // Or maybe it's just the ID
      this.validateTicket(decodedText);
    }
  }

  onScanFailure(error: any) {
    // Handle scan failure, usually better to ignore and keep scanning
  }

  validateTicket(id: string) {
    if (!id || this.validating) return;
    
    this.validating = true;
    this.http.post<any>(`${environment.apiUrl}/tickets/validate`, { ticketId: id }).subscribe({
      next: (res) => {
        this.result = { success: true, message: res.message };
        this.triggerToast();
        this.validating = false;
        if (this.scanner) this.scanner.pause();
      },
      error: (err) => {
        this.result = { success: false, message: err.error?.message || 'Invalid Ticket' };
        this.triggerToast();
        this.validating = false;
        if (this.scanner) this.scanner.pause();
      }
    });
  }

  triggerToast() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  resetScanner() {
    this.result = null;
    this.manualTicketId = '';
    if (this.scanner) {
      this.scanner.resume();
    }
  }
}
