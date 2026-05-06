import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private socketUrl = 'http://localhost:3000';

  constructor() {}

  setupSocket(): void {
    if (!this.socket) {
      this.socket = io(this.socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Socket.io connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.io error:', error);
      });
    }
  }

  joinConcert(concertId: string): void {
    if (this.socket) {
      this.socket.emit('joinConcert', concertId);
    }
  }

  leaveConcert(concertId?: string): void {
    if (this.socket && concertId) {
      this.socket.emit('leaveConcert', concertId);
    }
  }

  onSeatUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('seatUpdated', callback);
    }
  }

  onTicketStateChanged(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('ticketStateChanged', callback);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
