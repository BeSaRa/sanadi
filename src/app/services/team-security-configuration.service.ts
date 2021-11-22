import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {TeamSecurityConfiguration} from "@app/models/team-security-configuration";
import {UrlService} from "@app/services/url.service";
import {FactoryService} from "@app/services/factory.service";
import {Observable} from "rxjs";
import {Generator} from "@app/decorators/generator";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {TeamSecurityConfigurationInterceptor} from "@app/model-interceptors/team-security-configuration-interceptor";

@Injectable({
  providedIn: 'root'
})
export class TeamSecurityConfigurationService extends BackendGenericService<TeamSecurityConfiguration> {

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

  @Generator(undefined, true)
  private _loadSecurityByTeamId(teamId: number): Observable<TeamSecurityConfiguration[]> {
    return this.http.get<TeamSecurityConfiguration[]>(this._getServiceURL() + '/team/' + teamId);
  }

  loadSecurityByTeamId(teamId: number): Observable<TeamSecurityConfiguration[]> {
    return this._loadSecurityByTeamId(teamId);
  }
}
