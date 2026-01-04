import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplateManagementService {
  private apiUrl = `${environment.apiUrl}/templates`;

  constructor(private http: HttpClient) {}

  saveTemplate(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data); 
  }
  updateTemplate(id:Number,data: any): Observable<any> {
    return this.http.put(this.apiUrl+'/'+id, data); 
  }

  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
