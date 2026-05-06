import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-container">
      <!-- Hero Section -->
      <section class="hero animate-in">
        <div class="hero-content">
          <span class="badge">Next-Gen Ticketing</span>
          <h1>Experience Music <br><span class="gradient-text">Like Never Before</span></h1>
          <p>The first decentralized concert ticketing platform with real-time seat selection and blockchain security.</p>
          <div class="cta-group">
            <a routerLink="/events" class="btn btn-primary">Browse Events</a>
            <a href="#features" class="btn btn-outline">How it Works</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-ticket glass">
            <div class="ticket-header">
              <span>VIP PASS</span>
              <span class="live-dot">LIVE</span>
            </div>
            <div class="ticket-body">
              <h3>Neon Nights Tour</h3>
              <p>Stellar Arena | Row A1</p>
            </div>
            <div class="ticket-footer">
              <div class="barcode"></div>
            </div>
          </div>
          <div class="circle-decoration"></div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats">
        <div class="stat-item">
          <h3>100%</h3>
          <p>Secure Transactions</p>
        </div>
        <div class="stat-item">
          <h3>Real-time</h3>
          <p>Seat Selection</p>
        </div>
        <div class="stat-item">
          <h3>Blockchain</h3>
          <p>Verified Tickets</p>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features">
        <div class="section-title">
          <h2>Why Choose <span class="primary-color">StellarTickets?</span></h2>
          <p>We combine cutting-edge technology with an unmatched user experience.</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card glass">
            <div class="feature-icon">🛡️</div>
            <h3>Fraud Proof</h3>
            <p>Every ticket is uniquely logged on our custom blockchain, making duplication impossible.</p>
          </div>
          <div class="feature-card glass">
            <div class="feature-icon">⚡</div>
            <h3>Zero Latency</h3>
            <p>Experience instant seat updates with our Socket.IO powered real-time engine.</p>
          </div>
          <div class="feature-card glass">
            <div class="feature-icon">📱</div>
            <h3>QR Entry</h3>
            <p>Seamless entry with automated QR generation and high-speed validator support.</p>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="final-cta glass">
        <h2>Ready to join the revolution?</h2>
        <p>Get your tickets now or start organizing your own world-class events.</p>
        <div class="cta-buttons">
          <a routerLink="/register" class="btn btn-primary">Get Started Now</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Hero Section */
    .hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      padding: 6rem 0;
      min-height: 80vh;
    }
    .hero-content h1 {
      font-size: 4.5rem;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      font-weight: 800;
      letter-spacing: -2px;
      color: #1a1a2e;
    }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-content p {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 2.5rem;
      max-width: 500px;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border-radius: 2rem;
      font-weight: 700;
      font-size: 0.8rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cta-group { display: flex; gap: 1rem; }
    .btn {
      padding: 1rem 2.5rem;
      border-radius: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
    }
    .btn-primary {
      background: #6366f1;
      color: white;
      box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6); }
    .btn-outline {
      border: 2px solid #e2e8f0;
      color: #64748b;
    }
    .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

    /* Visual Section */
    .hero-visual { position: relative; }
    .floating-ticket {
      width: 350px;
      padding: 2.5rem;
      border-radius: 1.5rem;
      background: white;
      box-shadow: 0 50px 100px -20px rgba(0,0,0,0.1);
      border: 1px solid #eee;
      position: relative;
      z-index: 2;
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(5deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }
    .ticket-header { display: flex; justify-content: space-between; font-weight: 800; font-size: 0.7rem; margin-bottom: 2rem; color: #94a3b8; }
    .live-dot { color: #f43f5e; display: flex; align-items: center; gap: 0.5rem; }
    .live-dot:before { content: ''; width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
    .ticket-body h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #1e293b; }
    .barcode { height: 40px; background: repeating-linear-gradient(90deg, #1e293b, #1e293b 2px, transparent 2px, transparent 6px); margin-top: 2rem; opacity: 0.3; }
    
    .circle-decoration {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%);
      border-radius: 50%;
      z-index: 1;
    }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      padding: 4rem;
      background: white;
      border-radius: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin: 4rem 0;
      text-align: center;
    }
    .stat-item h3 { font-size: 2.5rem; color: #6366f1; margin-bottom: 0.5rem; }
    .stat-item p { color: #94a3b8; font-weight: 600; }

    /* Features */
    .features { padding: 6rem 0; }
    .section-title { text-align: center; margin-bottom: 4rem; }
    .section-title h2 { font-size: 3rem; margin-bottom: 1rem; color: #1e293b; }
    .section-title p { color: #64748b; font-size: 1.1rem; }
    .primary-color { color: #6366f1; }

    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
    .feature-card {
      padding: 3rem;
      border-radius: 1.5rem;
      background: white;
      border: 1px solid #f1f5f9;
      transition: all 0.3s;
    }
    .feature-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); border-color: #e0e7ff; }
    .feature-icon { font-size: 3rem; margin-bottom: 1.5rem; }
    .feature-card h3 { font-size: 1.25rem; margin-bottom: 1rem; color: #1e293b; }
    .feature-card p { color: #64748b; line-height: 1.6; }

    /* CTA Section */
    .final-cta {
      background: #1e293b;
      padding: 6rem;
      border-radius: 2.5rem;
      text-align: center;
      margin: 6rem 0;
      color: white;
    }
    .final-cta h2 { font-size: 3rem; margin-bottom: 1rem; }
    .final-cta p { font-size: 1.2rem; opacity: 0.7; margin-bottom: 3rem; }

    /* Animations */
    .animate-in {
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 968px) {
      .hero { grid-template-columns: 1fr; text-align: center; gap: 2rem; }
      .hero-content h1 { font-size: 3rem; }
      .hero-content p { margin: 0 auto 2.5rem; }
      .cta-group { justify-content: center; }
      .hero-visual { display: flex; justify-content: center; }
      .features-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingPageComponent {}
