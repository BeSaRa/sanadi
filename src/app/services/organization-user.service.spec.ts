import { TestBed } from '@angular/core/testing';

import { OrganizationUserService } from './organization-user.service';

describe('OrganizationUserService', () => {
  let service: OrganizationUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
