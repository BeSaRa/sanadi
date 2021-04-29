import { TestBed } from '@angular/core/testing';

import { SubventionRequestPartialService } from './subvention-request-partial.service';

describe('SubventionRequestPartialService', () => {
  let service: SubventionRequestPartialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionRequestPartialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
