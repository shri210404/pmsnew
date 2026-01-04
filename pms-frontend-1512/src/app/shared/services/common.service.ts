import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/proposal`;
  constructor(private http: HttpClient) {}

  submitLogin(data: any): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    console.log('Submitting login request to:', url);
    console.log('Full API URL:', this.apiUrl);
    console.log('Login payload:', data);
    // withCredentials is now set globally in app.config.ts
    return this.http.post(url, data).pipe(
      timeout(10000), // 10 second timeout
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          console.error('Login request timed out after 10 seconds');
          return throwError(() => new Error('Request timed out. Please check if the server is running.'));
        }
        console.error('Login request error:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  changePassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, { email, newPassword });
  }

  requestPasswordReset(emailOrUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { emailOrUsername });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  saveProposal(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  saveFutureJobsProfile(data: any): Observable<any> {
    return this.http.post(this.apiUrl+'/futurejobs', data);
  }

  listFutureJobsOnRole(payload:any):Observable<any>{
    return this.http.post(this.apiUrl + '/futureJobsByFilter', payload)
  }

  updateFutureJobsProfile(id: string, formData: FormData) {
    return this.http.put(`${this.apiUrl}/futurejobs/${id}`, formData);
  }
  searchFutureJobsProfile(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/futurejobs/searchRecords`, params);
  }

  saveCountry(data: any): Observable<any> {
    return this.http.post(this.apiUrl + '/country', data);
  }

  saveClient(data: any): Observable<any> {
    return this.http.post(this.apiUrl + '/client', data);
  }

  saveLanguage(data: any): Observable<any> {
    return this.http.post(this.apiUrl + '/language', data);
  }

  saveCurrency(data: any): Observable<any> {
    return this.http.post(this.apiUrl + '/currency', data);
  }

  getCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/country`);
  }

  getClients(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/client`);
  }

  getLanguage(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/language`);
  }

  getCurrency(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/currency`);
  }

  // New method to get templates
  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`);
  }

  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  getAllRecruriter(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/proposal/get-Recruiter`, data);
  }
  

  searchRecords(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proposal/searchRecord`, payload);
  }

  getTemplateByName(templateName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/name/${templateName}`);
  }

  downloadFileService(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/proposal/${id}/download`;
    return this.http.get(downloadUrl, { responseType: 'blob' });
  }

  getAllEmployee(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees`);
  }

  saveEmploye(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/employees`, payload);
  }

  updateEmployee(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${id}`, employeeData);
  }

  updateLanguage(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/language/${id}`, employeeData);
  }

  updateCurrency(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/currency/${id}`, employeeData);
  }

  updateCountry(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/country/${id}`, employeeData);
  }

  updateClient(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/client/${id}`, employeeData);
  }

  updateRoles(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${id}`, employeeData);
  }

  saveRole(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/roles`, payload);
  }

  saveUserClient(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user-client`, payload);
  }

  updateUserClient(userId: string, clientId: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user-client/${userId}/${clientId}`, payload);
  }

  getUserClientByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-client/${userId}`);
  }

  saveUserRole(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/userroles`, payload);
  }

  updateUserRoles(id: string, employeeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/userroles/${id}`, employeeData);
  }

  getUserClient(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/user-client`);
  }

  duplicateCheck(email: any): Observable<any> {
    const payload = { email: email };
    return this.http.post<any>(`${this.apiUrl}/proposal/email-check`, payload);
  }

  getUserClientRoleList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/users`);
  }

  userRoleListData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/userroles`);
  }

  deleteCurrency(currencyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/currency/${currencyId}`);
  }

  deleteClient(currencyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/client/${currencyId}`);
  }

  deleteCountry(currencyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/country/${currencyId}`);
  }

  deletelanguage(currencyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/language/${currencyId}`);
  }

  downloadFile(fileKey: string): void {
    const filename = fileKey.split('/').pop() || 'file';

    this.http.get(`${this.apiUrl}/proposal/download-url?fileKey=${filename}`).subscribe(
      (response: any) => {
        const fileUrl = response.url;
        this.http.get(fileUrl, { responseType: 'blob' }).subscribe(
          (blob: Blob) => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
            link.remove();
          },
          (error) => {
            console.error('Error downloading file:', error);
          }
        );
      },
      (error) => {
        console.error('Error generating pre-signed URL:', error);
      }
    );
  }

}
