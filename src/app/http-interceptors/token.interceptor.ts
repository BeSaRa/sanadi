import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TokenService} from '@services/token.service';
import {ConfigurationService} from '@services/configuration.service';
import {SURVEY_TOKEN} from "@app/http-context/tokens";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService, private configurationService: ConfigurationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.tokenService.isExcludedUrl(request.urlWithParams) && this.tokenService.hasToken()) {
      request = request.clone({
        setHeaders: {[this.configurationService.CONFIG.TOKEN_HEADER_KEY]: this.tokenService.getToken()}
      });
    } else if (request.context.get(SURVEY_TOKEN) && request.context.get(SURVEY_TOKEN) !== SURVEY_TOKEN.defaultValue()) {
      request = request.clone({
        setHeaders: {[this.configurationService.CONFIG.TOKEN_HEADER_KEY]: request.context.get(SURVEY_TOKEN)}
      });
    }
    return next.handle(request);
  }
}
