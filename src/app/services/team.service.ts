import { Injectable } from '@angular/core';
import { Team } from '../models/team';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { UserService } from './user.service';
import { forkJoin, Observable, of } from 'rxjs';
import { InternalUser } from '../models/internal-user';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { DialogService } from './dialog.service';
import { TeamPopupComponent } from '../administration/popups/team-popup/team-popup.component';
import { map, switchMap } from 'rxjs/operators';
import { ITeamCriteria } from '@contracts/i-team-criteria';
import { InternalDepartmentService } from './internal-department.service';
import { InternalDepartment } from '../models/internal-department';
import { UserTeam } from '@app/models/user-team';
import { UserTeamService } from '@app/services/user-team.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from '@app/models/pagination';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { ComponentType } from '@angular/cdk/portal';

@CastResponseContainer({
  $default: {
    model: () => Team,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Team }
  }
})
@Injectable({
  providedIn: 'root'
})
export class TeamService extends CrudWithDialogGenericService<Team> {

  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }

  list: Team[] = [];

  constructor(public http: HttpClient,
              private userService: UserService,
              private urlService: UrlService,
              public dialog: DialogService,
              private userTeamService: UserTeamService,
              private internalDepartmentService: InternalDepartmentService) {
    super();
    FactoryService.registerService('TeamService', this);
  }

  _getModel(): any {
    return Team;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TEAMS;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByIdComposite(id: number): Observable<Team> {
    return this.http.get<Team>(this._getServiceURL() + '/' + id + '/composite');
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadByCriteria(criteria: Partial<ITeamCriteria>): Observable<Team[]> {
    return this.http.get<Team[]>(this._getServiceURL() + '/criteria' + this._parseObjectToQueryString(criteria));
  }

  loadTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this.userService.loadTeamMembers(teamId);
  }
  loadActiveTeamMembers(teamId: number): Observable<InternalUser[]> {
    return this.userService.loadActiveTeamMembers(teamId);
  }

  private _loadDialogData(teamId?: number): Observable<{ team: Team, internalDepartments: InternalDepartment[] }> {
    return forkJoin({
      team: !teamId ? of(new Team()) : this.loadByIdComposite(teamId),
      internalDepartments: this.internalDepartmentService.loadDepartments()
    });
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadDialogData()
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.CREATE,
            parentDepartmentsList: result.internalDepartments
          }));
        })
      );
  }

  editDialogComposite(model: Team): Observable<DialogRef> {
    return this._loadDialogData(model.id)
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.UPDATE,
            parentDepartmentsList: result.internalDepartments
          }));
        })
      );
  }

  openViewDialog(model: Team): Observable<DialogRef> {
    return this._loadDialogData(model.id)
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.VIEW,
            parentDepartmentsList: result.internalDepartments
          }));
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
