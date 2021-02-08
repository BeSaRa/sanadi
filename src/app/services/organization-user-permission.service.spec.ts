import { TestBed } from '@angular/core/testing';

import { OrganizationUserPermissionService } from './organization-user-permission.service';

describe('OrganizationUserPermissionService', () => {
  let service: OrganizationUserPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationUserPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
