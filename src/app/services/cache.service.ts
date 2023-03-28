import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {tap} from 'rxjs/operators';
import {ToastService} from './toast.service';
import {LangService} from './lang.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private http: HttpClient,
              private urlService: UrlService,
              private toastService: ToastService,
              private langService: LangService) {
  }

  _refreshCache(): any {
    return this.http.get(this.urlService.URLS.CACHE_SERVICE).pipe(tap(_ => {
      this.toastService.success(this.langService.map.msg_update_cache_success);
    }));
  }

  refreshCache(reloadAfterSuccess: boolean = false): void {
    const refreshSub = this._refreshCache().subscribe(() => {
      reloadAfterSuccess && window.location.reload();
      refreshSub.unsubscribe();
    });
  }

}
