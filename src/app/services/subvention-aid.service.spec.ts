import { TestBed } from '@angular/core/testing';

import { SubventionAidService } from './subvention-aid.service';

describe('SubventionAidService', () => {
  let service: SubventionAidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubventionAidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
