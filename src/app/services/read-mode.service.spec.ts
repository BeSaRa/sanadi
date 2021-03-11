import { TestBed } from '@angular/core/testing';

import { ReadModeService } from './read-mode.service';

describe('ReadModeService', () => {
  let service: ReadModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
