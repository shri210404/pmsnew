import { Component,OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";

import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ MatListModule, RouterLink ,MatExpansionModule,CommonModule,FormsModule,MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
accountDetails:  any;

ngOnInit(): void {
  this.accountDetails =localStorage.getItem('account-details')
    if (this.accountDetails) {
     this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
}

isAdminRole(): boolean {
  return this.accountDetails.role === 'Admin'; // Check if the user is an admin
}

isRecruiterRole(): boolean {
  return this.accountDetails.role === 'Recruiter'; // Check if the user is a recruiter
}

}
