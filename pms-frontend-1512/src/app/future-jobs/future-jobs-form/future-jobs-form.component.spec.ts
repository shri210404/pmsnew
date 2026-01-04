import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureJobsFormComponent } from './future-jobs-form.component';

describe('FutureJobsFormComponent', () => {
  let component: FutureJobsFormComponent;
  let fixture: ComponentFixture<FutureJobsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FutureJobsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FutureJobsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
