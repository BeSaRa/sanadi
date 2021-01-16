import { TestBed } from '@angular/core/testing';

import { CustomRolePermissionService } from './custom-role-permission.service';

describe('CustomRolePermissionService', () => {
  let service: CustomRolePermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomRolePermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
