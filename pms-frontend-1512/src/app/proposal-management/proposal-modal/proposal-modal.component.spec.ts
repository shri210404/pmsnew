import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalModalComponent } from './proposal-modal.component';

describe('ProposalModalComponent', () => {
  let component: ProposalModalComponent;
  let fixture: ComponentFixture<ProposalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
