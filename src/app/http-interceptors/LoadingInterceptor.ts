import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoadingService} from '../services/loading.service';
import {finalize} from 'rxjs/operators';
import {NO_LOADER_TOKEN} from '@app/http-context/tokens';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  static requests: Map<string, HttpRequest<any>> = new Map();

  constructor(private loadingService: LoadingService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(NO_LOADER_TOKEN)) {
      return next.handle(req);
    }
    this.loadingService.show();
    LoadingInterceptor.requests.set(req.urlWithParams, req.clone());
    return next.handle(req).pipe(
      finalize(((req) => {
        return () => {
          if (LoadingInterceptor.requests.has(req.urlWithParams)) {
            LoadingInterceptor.requests.delete(req.urlWithParams);
          }
          LoadingInterceptor.requests.size === 0 ? this.loadingService.hide() : null;
        };
      })(req))
    );
  }

}
