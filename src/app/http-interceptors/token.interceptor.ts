import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TokenService} from '../services/token.service';
import {ConfigurationService} from '../services/configuration.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService, private configurationService: ConfigurationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.tokenService.isExcludedUrl(request.urlWithParams) && this.tokenService.hasToken()) {
      request = request.clone({
        setHeaders: {[this.configurationService.CONFIG.TOKEN_HEADER_KEY]: this.tokenService.getToken()}
      });
    }
    return next.handle(request);
  }
}
