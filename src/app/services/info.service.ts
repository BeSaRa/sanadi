import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {ILoginInfo} from '@contracts/i-login-info';
import {CastResponse} from "@decorators/cast-response";
import {LoginInfo} from "@app/models/login-info";
import {GlobalSettingsService} from '@services/global-settings.service';
import {UserPreferencesService} from '@services/user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http: HttpClient,
              private urlService: UrlService,
              private userPreferencesService: UserPreferencesService, // to use in employeeService for interceptors
              private globalSettingsService: GlobalSettingsService,) {
  }

  setInfoData(data: ILoginInfo) {
    this.globalSettingsService.setGlobalSettings(data.globalSetting);
  }

  getGlobalSettings() {
    return this.globalSettingsService.getGlobalSettings();
  }

  @CastResponse(() => LoginInfo)
  load(): Observable<ILoginInfo> {
    return this.http.get<ILoginInfo>(this.urlService.URLS.LOGIN_INFO);
  };
}
