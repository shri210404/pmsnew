import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobOrderService {
  private apiUrl = `${environment.apiUrl}/job-order`;

  constructor(private http: HttpClient) {}

  createJobOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  getJobOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAllJobOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getNextJobId(): Observable<{ jobId: string }> {
    return this.http.get<{ jobId: string }>(`${this.apiUrl}/next-job-id`);
  }

  getJobOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateJobOrder(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteJobOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCandidateStatistics(id: string): Observable<{
    submitted: number;
    proposed: number;
    selected: number;
    joined: number;
    rejected: number;
  }> {
    return this.http.get<{
      submitted: number;
      proposed: number;
      selected: number;
      joined: number;
      rejected: number;
    }>(`${this.apiUrl}/${id}/statistics`);
  }
}
