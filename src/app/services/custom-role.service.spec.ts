import { TestBed } from '@angular/core/testing';

import { CustomRoleService } from './custom-role.service';

describe('CustomRoleService', () => {
  let service: CustomRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
