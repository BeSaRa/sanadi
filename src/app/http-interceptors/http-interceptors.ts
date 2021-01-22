import {Provider} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BackendExceptionHandlerInterceptor} from './backend-exception-handler-interceptor';

export const httpInterceptors: Provider [] = [
  {provide: HTTP_INTERCEPTORS, useClass: BackendExceptionHandlerInterceptor, multi: true}
];
