import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Team} from '../models/team';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {TeamInterceptor} from '../model-interceptors/team-interceptor';
import {FactoryService} from './factory.service';
import {UserService} from './user.service';
import {Observable} from 'rxjs';
import {InternalUser} from '../models/internal-user';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends BackendGenericService<Team> {
  list: Team[] = [];
  interceptor: Partial<IModelInterceptor<Team>> = new TeamInterceptor();

  constructor(public http: HttpClient,
              private userService: UserService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('TeamService', this);
  }

  _getModel(): any {
    return Team;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TEAMS;
  }

  loadTeamMembers(teamId: number) : Observable<InternalUser[]> {
    return this.userService.loadTeamMembers(teamId);
  }
}
