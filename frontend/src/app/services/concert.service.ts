import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConcertService {
  private apiUrl = 'http://localhost:3000/concerts';

  constructor(private http: HttpClient) {}

  getAllConcerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getConcertById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createConcert(concertData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, concertData);
  }
}
