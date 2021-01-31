import { TestBed } from '@angular/core/testing';

import { SubventionRequestAidService } from './subvention-request-aid.service';

describe('SubventionRequestAidService', () => {
  let service: SubventionRequestAidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionRequestAidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
