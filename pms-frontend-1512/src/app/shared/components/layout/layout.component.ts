import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  public sidebarExpanded = true;
  public toggleSidebar($event: boolean) {
    this.sidebarExpanded = $event;
  }
}
