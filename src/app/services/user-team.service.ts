import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserTeam } from "@app/models/user-team";
import { FactoryService } from "@app/services/factory.service";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { UserTeamInterceptor } from "@app/model-interceptors/user-team-interceptor";
import { UrlService } from "@app/services/url.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IDefaultResponse } from "@app/interfaces/idefault-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";

@CastResponseContainer({
  $default: {
    model: () => UserTeam
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => UserTeam }
  }
})
@Injectable({
  providedIn: 'root'
})
export class UserTeamService extends CrudGenericService<UserTeam> {
  list: UserTeam[] = [];
  interceptor: IModelInterceptor<UserTeam> = new UserTeamInterceptor();

  _getModel() {
    return UserTeam;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    throw new Error('Method not implemented.');
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('UserTeamService', this);
  }

  @CastResponse(undefined)
  loadUserTeamByUserId(generalUserId: number): Observable<UserTeam[]> {
    return this.http.get<UserTeam[]>(this.urlService.URLS.TEAMS + '/user-teams/' + generalUserId)
  }

  @HasInterception
  createUserTeam(@InterceptParam() userTeam: Partial<UserTeam>): Observable<number> {
    return this.http.post<IDefaultResponse<number>>(this.urlService.URLS.TEAMS + '/add-user', userTeam)
      .pipe(map((res) => res.rs))
  }

  deleteBulk(userTeamIds: number[]): Observable<Record<number, boolean>> {
    return this.http.request<IDefaultResponse<Record<number, boolean>>>('DELETE', this.urlService.URLS.TEAMS + '/remove-users/bulk', {
      body: userTeamIds
    }).pipe(map(res => res.rs));
  }

  deactivate(userTeamsIds: number[]): Observable<Record<number, boolean>> {
    return this.http.put<IDefaultResponse<Record<number, boolean>>>(this.urlService.URLS.TEAMS + '/de-activate-users/bulk', userTeamsIds)
      .pipe(map(res => res.rs));
  }

  activate(userTeamsIds: number[]): Observable<Record<number, boolean>> {
    return this.http.put<IDefaultResponse<Record<number, boolean>>>(this.urlService.URLS.TEAMS + '/activate-users/bulk', userTeamsIds)
      .pipe(map(res => res.rs));
  }

}
