import { TestBed } from '@angular/core/testing';

import { SubventionResponseService } from './subvention-response.service';

describe('SubventionResponseService', () => {
  let service: SubventionResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionResponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
