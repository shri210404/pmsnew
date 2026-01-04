import { NgClass } from "@angular/common";
import { Component, Input } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

// Update the type to be more flexible
export type ActivityFeed = Record<string, number>; // This allows any key-value pairs

@Component({
  selector: 'app-tiles',
  standalone: true,
  imports: [MatIconModule, NgClass],
  templateUrl: './tiles.component.html',
  styleUrl: './tiles.component.scss'
})
export class TilesComponent {
  @Input() title!: string;
  @Input() displayValue!: number | string;
  @Input() ico!: string;
  @Input() bgClass!: string;

  @Input({ required: false }) activityFeed: ActivityFeed | null = null;

  getActivityFeedItems(): {key: string, value: number}[] {
    if (!this.activityFeed) return [];
    return Object.entries(this.activityFeed).map(([key, value]) => ({ key, value }));
  }
}