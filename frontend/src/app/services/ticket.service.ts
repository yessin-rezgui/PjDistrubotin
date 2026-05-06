import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = 'http://localhost:3000/tickets';
  private concertsUrl = 'http://localhost:3000/concerts';

  constructor(private http: HttpClient) {}

  getSeats(concertId: string): Observable<any> {
    return this.http.get(`${this.concertsUrl}/${concertId}/seats`);
  }

  buyTicket(concertId: string, seatLabel: string, ownerName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/buy`, {
      concertId,
      seatLabel,
      ownerName,
    });
  }

  validateTicket(concertId: string, seatLabel: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, {
      concertId,
      seatLabel,
    });
  }

  cancelTicket(concertId: string, seatLabel: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, {
      concertId,
      seatLabel,
    });
  }

  changeTicketOwnerName(
    concertId: string,
    seatLabel: string,
    newOwnerName: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-name`, {
      concertId,
      seatLabel,
      newOwnerName,
    });
  }
}
