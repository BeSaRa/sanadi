import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {UserSecurityConfiguration} from "@app/models/user-security-configuration";
import {UrlService} from "@app/services/url.service";
import {FactoryService} from "@app/services/factory.service";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {UserSecurityConfigurationInterceptor} from "@app/model-interceptors/user-security-configuration-interceptor";
import {Generator} from "@app/decorators/generator";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserSecurityConfigurationService extends BackendGenericService<UserSecurityConfiguration> {
  list: UserSecurityConfiguration[] = [];
  interceptor: IModelInterceptor<UserSecurityConfiguration> = new UserSecurityConfigurationInterceptor();

  constructor(public http: HttpClient, public urlService: UrlService) {
    super();
    FactoryService.registerService('UserSecurityConfigurationService', this);
  }

  _getModel() {
    return UserSecurityConfiguration;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.USER_SECURITY;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  @Generator(undefined, true)
  private _loadSecurityByTeamId(teamId: number, generalUserId: number): Observable<UserSecurityConfiguration[]> {
    return this.http.get<UserSecurityConfiguration[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({
        fromObject: {
          teamId,
          generalUserId
        }
      })
    });
  }

  loadSecurityByTeamId(teamId: number, generalUserId: number): Observable<UserSecurityConfiguration[]> {
    return this._loadSecurityByTeamId(teamId, generalUserId);
  }

  @Generator(undefined, true)
  createBulk(securityConfiguration: Partial<UserSecurityConfiguration>[]): Observable<UserSecurityConfiguration[]> {
    return this.http.post<UserSecurityConfiguration[]>(this._getServiceURL() + '/bulk/full', securityConfiguration)
  }
}
