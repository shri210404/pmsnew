import { TestBed } from '@angular/core/testing';

import { TemplateManagementService } from './template-management.service';

describe('TemplateManagementService', () => {
  let service: TemplateManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
