import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { ILoginInfo } from '@contracts/i-login-info';
import { CastResponse } from "@decorators/cast-response";
import { LoginInfo } from "@app/models/login-info";

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient,
              private urlService: UrlService) {
  }

  @CastResponse(() => LoginInfo)
  load(): Observable<ILoginInfo> {
    return this.http.get<ILoginInfo>(this.urlService.URLS.LOGIN_INFO);
  }
}
