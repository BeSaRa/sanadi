import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TeamSecurityConfiguration} from '@app/models/team-security-configuration';
import {UrlService} from '@app/services/url.service';
import {FactoryService} from '@app/services/factory.service';
import {Observable} from 'rxjs';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {TeamSecurityConfigurationInterceptor} from '@app/model-interceptors/team-security-configuration-interceptor';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Pagination} from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => TeamSecurityConfiguration
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => TeamSecurityConfiguration}
  }
})
@Injectable({
  providedIn: 'root'
})
export class TeamSecurityConfigurationService extends CrudGenericService<TeamSecurityConfiguration> {

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('TeamSecurityConfigurationService', this);
  }

  list: TeamSecurityConfiguration[] = [];
  interceptor: IModelInterceptor<TeamSecurityConfiguration> = new TeamSecurityConfigurationInterceptor();

  _getModel() {
    return TeamSecurityConfiguration;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TEAM_SECURITY;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  @CastResponse(undefined)
  private _loadSecurityByTeamId(teamId: number): Observable<TeamSecurityConfiguration[]> {
    return this.http.get<TeamSecurityConfiguration[]>(this._getServiceURL() + '/team/' + teamId);
  }

  loadSecurityByTeamId(teamId: number): Observable<TeamSecurityConfiguration[]> {
    return this._loadSecurityByTeamId(teamId);
  }

  @CastResponse(undefined)
  loadSecurityByTeamIdAndProfileId(teamId: number, profileId: number): Observable<TeamSecurityConfiguration[]> {
    return this.http.get<TeamSecurityConfiguration[]>(this._getServiceURL() + '/team/' + teamId, {
      params: new HttpParams().set('profileId', profileId)
    });
  }
}
