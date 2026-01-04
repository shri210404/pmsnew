import { Component, EventEmitter, Input, Output,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule,MatMenuModule,MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  @Input({ required: true }) isExpanded!: boolean;
  @Output() onToggle = new EventEmitter<boolean>();
  accountDetails:any;
  public isOpen = true;

  ngOnInit(): void {
     this.accountDetails =localStorage.getItem('account-details')
     if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
      
    }
    
  }

  constructor(private router: Router) { }

  public logout(): void {
    this.router.navigate(['/login']);
  }

  public profile(): void {
    this.router.navigate(['/app/profile']);
  }

  public toggleSidebar(): void {
    this.onToggle.emit(!this.isExpanded);
  }

}