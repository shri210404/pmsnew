import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalManagementComponent } from './proposal-management.component';

describe('ProposalManagementComponent', () => {
  let component: ProposalManagementComponent;
  let fixture: ComponentFixture<ProposalManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
