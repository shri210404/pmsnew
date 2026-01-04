import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/proposal`;

  constructor(private http: HttpClient) {}

  getReportsData(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, { params });
  }


  sendEmail(payload:any): Observable<any> {
    // Make the HTTP request to the backend API that sends the email via SendGrid
    return this.http.post(this.apiUrl+'/send-email', payload);
  }

}
