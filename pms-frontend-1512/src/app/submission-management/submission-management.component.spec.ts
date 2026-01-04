import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionManagementComponent } from './submission-management.component';

describe('SubmissionManagementComponent', () => {
  let component: SubmissionManagementComponent;
  let fixture: ComponentFixture<SubmissionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
