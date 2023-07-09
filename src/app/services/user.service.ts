import { Injectable } from '@angular/core';
import { InternalUser } from '../models/internal-user';
import { InternalUserInterceptor } from '../model-interceptors/internal-user-interceptor';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { Observable } from 'rxjs';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => InternalUser
  }
})
@Injectable({
  providedIn: 'root'
})
export class UserService extends CrudGenericService<InternalUser> {
  interceptor: IModelInterceptor<InternalUser> = new InternalUserInterceptor();
  list: InternalUser[] = [];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('UserService', this);
  }

  _getModel(): any {
    return InternalUser;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_USER;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this.http.get<InternalUser[]>(this.urlService.URLS.TEAMS + '/members/' + teamId);
  }

  loadTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this._loadTeamMembers(teamId);
  }
  loadActiveTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this._loadActiveTeamMembers(teamId);
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadActiveTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this.http.get<InternalUser[]>(this.urlService.URLS.TEAMS + '/members-all/' + teamId);
  }



}
