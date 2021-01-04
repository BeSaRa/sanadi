import {Provider} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BackendHttpMockInterceptor} from './backend-http-mock-interceptor';

export const httpInterceptors: Provider [] = [
  {provide: HTTP_INTERCEPTORS, useClass: BackendHttpMockInterceptor, multi: true}
];
