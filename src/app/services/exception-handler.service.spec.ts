import { TestBed } from '@angular/core/testing';

import { ExceptionHandlerService } from './exception-handler.service';

describe('ExceptionHandlerService', () => {
  let service: ExceptionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExceptionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
