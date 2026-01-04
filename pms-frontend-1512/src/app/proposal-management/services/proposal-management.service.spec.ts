import { TestBed } from '@angular/core/testing';

import { ProposalManagementService } from './proposal-management.service';

describe('ProposalManagementService', () => {
  let service: ProposalManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposalManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
