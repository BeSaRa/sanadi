import { UserSubTeam } from './../models/user-sub-team';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FactoryService } from "@app/services/factory.service";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { UrlService } from "@app/services/url.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IDefaultResponse } from "@app/interfaces/idefault-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { UserSubTeamInterceptor } from '@app/model-interceptors/user-sub-team-interceptor';
import { HasInterception, InterceptParam } from '@app/decorators/decorators/intercept-model';

@CastResponseContainer({
  $default: {
    model: () => UserSubTeam
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => UserSubTeam }
  }
})
@Injectable({
  providedIn: 'root'
})
export class UserSubTeamService extends CrudGenericService<UserSubTeam> {
  list: UserSubTeam[] = [];
  interceptor: IModelInterceptor<UserSubTeam> = new UserSubTeamInterceptor();

  _getModel() {
    return UserSubTeam;
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
    FactoryService.registerService('UserSubTeamService', this);
  }

  @CastResponse(undefined)
  loadUserSubTeamByUserId(generalUserId: number): Observable<UserSubTeam[]> {
    return this.http.get<UserSubTeam[]>(this.urlService.URLS.USER_SUB_TEAM + '/user/' + generalUserId)
  }

  @HasInterception
  createUserSubTeam(@InterceptParam() userTeam: Partial<UserSubTeam>): Observable<number> {
    return this.http.post<IDefaultResponse<number>>(this.urlService.URLS.USER_SUB_TEAM, userTeam)
      .pipe(map((res) => res.rs))
  }

  deleteBulk(userTeamIds: number[]): Observable<Record<number, boolean>> {
    return this.http.request<IDefaultResponse<Record<number, boolean>>>('DELETE', this.urlService.URLS.USER_SUB_TEAM + '/user/bulk', {
      body: userTeamIds
    }).pipe(map(res => res.rs));
  }

  deactivate(userTeamsIds: number[]): Observable<Record<number, boolean>> {
    return this.http.put<IDefaultResponse<Record<number, boolean>>>(this.urlService.URLS.USER_SUB_TEAM + '/de-activate-users/bulk', userTeamsIds)
      .pipe(map(res => res.rs));
  }

  activate(userTeamsIds: number[]): Observable<Record<number, boolean>> {
    return this.http.put<IDefaultResponse<Record<number, boolean>>>(this.urlService.URLS.USER_SUB_TEAM + '/activate-users/bulk', userTeamsIds)
      .pipe(map(res => res.rs));
  }

}
