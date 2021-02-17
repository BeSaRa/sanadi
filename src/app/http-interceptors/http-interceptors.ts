import {Provider} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BackendExceptionHandlerInterceptor} from './backend-exception-handler-interceptor';
import {TokenInterceptor} from './token.interceptor';
import {LoadingInterceptor} from './LoadingInterceptor';

export const httpInterceptors: Provider [] = [
  {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: BackendExceptionHandlerInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true}
];
