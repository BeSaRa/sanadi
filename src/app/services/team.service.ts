import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Team} from '../models/team';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {TeamInterceptor} from '../model-interceptors/team-interceptor';
import {FactoryService} from './factory.service';
import {UserService} from './user.service';
import {forkJoin, Observable, of} from 'rxjs';
import {InternalUser} from '../models/internal-user';
import {Generator} from '../decorators/generator';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {DialogService} from './dialog.service';
import {TeamPopupComponent} from '../administration/popups/team-popup/team-popup.component';
import {map, switchMap} from 'rxjs/operators';
import {ITeamCriteria} from '../interfaces/i-team-criteria';
import {InternalDepartmentService} from './internal-department.service';
import {InternalDepartment} from '../models/internal-department';
import {UserTeam} from "@app/models/user-team";
import {UserTeamService} from "@app/services/user-team.service";

@Injectable({
  providedIn: 'root'
})
export class TeamService extends BackendGenericService<Team> {
  list: Team[] = [];
  interceptor: Partial<IModelInterceptor<Team>> = new TeamInterceptor();

  constructor(public http: HttpClient,
              private userService: UserService,
              private urlService: UrlService,
              private dialogService: DialogService,
              private userTeamService: UserTeamService,
              private internalDepartmentService: InternalDepartmentService) {
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

  @Generator(undefined, true)
  loadComposite(): Observable<Team[]> {
    return this.http.get<Team[]>(this._getServiceURL() + '/composite');
  }

  @Generator(undefined, false)
  loadByIdComposite(id: number): Observable<Team> {
    return this.http.get<Team>(this._getServiceURL() + '/' + id + '/composite');
  }

  @Generator(undefined, true)
  loadByCriteria(criteria: Partial<ITeamCriteria>): Observable<Team[]> {
    return this.http.get<Team[]>(this._getServiceURL() + '/criteria' + this._parseObjectToQueryString(criteria));
  }

  loadTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this.userService.loadTeamMembers(teamId);
  }

  private _loadDialogData(teamId?: number): Observable<{
    team: Team,
    internalDepartments: InternalDepartment[]
  }> {
    return forkJoin({
      team: !teamId ? of(new Team()) : this.loadByIdComposite(teamId),
      internalDepartments: this.internalDepartmentService.loadDepartments()
    });
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadDialogData()
      .pipe(
        switchMap((result) => {
          return of(this.dialogService.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.CREATE,
            parentDepartmentsList: result.internalDepartments
          }))
        })
      );
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this._loadDialogData(modelId)
      .pipe(
        switchMap((result) => {
          return of(this.dialogService.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.UPDATE,
            parentDepartmentsList: result.internalDepartments
          }))
        })
      );
  }

  createTeamUserLink(userTeam: Partial<UserTeam>): Observable<UserTeam> {
    return this.userTeamService.createUserTeam(userTeam).pipe(map(id => new UserTeam().clone({
      ...userTeam,
      status: 1,
      id
    })));
  }

  loadUserTeamsByUserId(generalUserId: number) {
    return this.userTeamService.loadUserTeamByUserId(generalUserId);
  }

  deleteUserTeamBulk(ids: number[]): Observable<Record<number, boolean>> {
    return this.userTeamService.deleteBulk(ids);
  }
}
