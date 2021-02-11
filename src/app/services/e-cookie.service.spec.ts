import { TestBed } from '@angular/core/testing';

import { ECookieService } from './e-cookie.service';

describe('ECookieService', () => {
  let service: ECookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ECookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
