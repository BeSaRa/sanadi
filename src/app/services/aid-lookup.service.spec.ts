import { TestBed } from '@angular/core/testing';

import { AidLookupService } from './aid-lookup.service';

describe('AidLookupService', () => {
  let service: AidLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AidLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
