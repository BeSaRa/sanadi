import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';
import {interceptLoginInfo} from '../model-interceptors/login-info-interceptor';
import {ILoginInfo} from '../interfaces/i-login-info';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient,
              private urlService: UrlService) {
  }

  @Generator(undefined, false, {interceptReceive: interceptLoginInfo})
  load(): Observable<ILoginInfo> {
    return this.http.get<ILoginInfo>(this.urlService.URLS.LOGIN_INFO);
  }
}
