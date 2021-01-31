import { TestBed } from '@angular/core/testing';

import { SubventionRequestService } from './subvention-request.service';

describe('SubventionRequestService', () => {
  let service: SubventionRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
