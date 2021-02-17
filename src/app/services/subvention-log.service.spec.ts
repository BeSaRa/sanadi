import { TestBed } from '@angular/core/testing';

import { SubventionLogService } from './subvention-log.service';

describe('SubventionLogService', () => {
  let service: SubventionLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
