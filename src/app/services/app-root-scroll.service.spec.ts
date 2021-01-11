import { TestBed } from '@angular/core/testing';

import { AppRootScrollService } from './app-root-scroll.service';

describe('AppRootScrollService', () => {
  let service: AppRootScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppRootScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
