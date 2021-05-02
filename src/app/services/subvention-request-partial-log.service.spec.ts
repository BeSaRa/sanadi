import { TestBed } from '@angular/core/testing';

import { SubventionRequestPartialLogService } from './subvention-request-partial-log.service';

describe('SubventionRequestPartialLogService', () => {
  let service: SubventionRequestPartialLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionRequestPartialLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
