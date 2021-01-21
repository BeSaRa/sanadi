import { TestBed } from '@angular/core/testing';

import { OrganizationBranchService } from './organization-branch.service';

describe('OrganizationBranchService', () => {
  let service: OrganizationBranchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationBranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
