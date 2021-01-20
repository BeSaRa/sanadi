import { TestBed } from '@angular/core/testing';

import { OrganizationUnitService } from './organization-unit.service';

describe('OrganizationUnitService', () => {
  let service: OrganizationUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
