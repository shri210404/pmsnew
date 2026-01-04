import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base Component with Auto-Unsubscribe Pattern
 * 
 * Extend this class in components that have subscriptions to prevent memory leaks.
 * 
 * Usage:
 * ```typescript
 * export class MyComponent extends BaseComponent implements OnInit {
 *   constructor() {
 *     super();
 *   }
 * 
 *   ngOnInit() {
 *     this.service.getData()
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(data => {
 *         // Handle data
 *       });
 *   }
 * }
 * ```
 * 
 * The destroy$ subject will automatically complete when the component is destroyed,
 * unsubscribing from all observables that use takeUntil(this.destroy$).
 */
@Injectable()
export abstract class BaseComponent implements OnDestroy {
  /**
   * Subject that emits when the component is destroyed.
   * Use with takeUntil() operator to automatically unsubscribe from observables.
   * 
   * Example:
   * ```typescript
   * this.service.getData()
   *   .pipe(takeUntil(this.destroy$))
   *   .subscribe(data => { ... });
   * ```
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * Lifecycle hook that completes the destroy$ subject,
   * which will automatically unsubscribe from all observables
   * that use takeUntil(this.destroy$).
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

