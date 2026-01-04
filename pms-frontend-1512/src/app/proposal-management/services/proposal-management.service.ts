import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProposalManagementService implements OnInit {
  accountDetails:any;
  private apiUrl = `${environment.apiUrl}/proposal`;
  payloadFilter: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.accountDetails =localStorage.getItem('account-details');

    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
    this.payloadFilter ={
      'role':this.accountDetails.role,
      'reportsTo':this.accountDetails.reportsTo
    }
  }

  saveProposal(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data); 
  }
  updateProposal(id:Number,data: any): Observable<any> {
    return this.http.put(this.apiUrl+'/'+id, data); 
  }

  getProposal(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  
  getProposalById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteProposal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getProposalsByFilter(
    role: string, 
    reportsTo: string, 
    id: string,
    dateFrom?:any,
    dateTo?:any,
    isDashboard?:any
  ): Observable<any> {

    const payload = { role, reportsTo, id,dateFrom,dateTo,isDashboard };

    return this.http.post<any>(this.apiUrl+"/proposalByFilter", payload);
  }

  getUserList(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/employees`);
  }
}
