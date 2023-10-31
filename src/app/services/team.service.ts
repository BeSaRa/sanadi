import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { UserTeam } from '@app/models/user-team';
import { SectorService } from '@app/services/sector.service';
import { UserTeamService } from '@app/services/user-team.service';
import { IDialogData } from '@contracts/i-dialog-data';
import { ITeamCriteria } from '@contracts/i-team-criteria';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TeamPopupComponent } from '../administration/popups/team-popup/team-popup.component';
import { OperationTypes } from '../enums/operation-types.enum';
import { InternalDepartment } from '../models/internal-department';
import { InternalUser } from '../models/internal-user';
import { Team } from '../models/team';
import { DialogRef } from '../shared/models/dialog-ref';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { InternalDepartmentService } from './internal-department.service';
import { UrlService } from './url.service';
import { UserService } from './user.service';
import { Sector } from '@app/models/sector';

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
              private internalDepartmentService: InternalDepartmentService,
              private sectorService:SectorService) {
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

  private _loadDialogData(teamId?: number): Observable<{ team: Team, internalDepartments: InternalDepartment[],sectors:Sector[] }> {
    return forkJoin({
      team: !teamId ? of(new Team()) : this.loadByIdComposite(teamId),
      internalDepartments: this.internalDepartmentService.loadDepartments(),
      sectors:this.sectorService.loadAsLookups()
    });
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadDialogData()
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<Team>>(TeamPopupComponent, {
            model: result.team,
            operation: OperationTypes.CREATE,
            parentDepartmentsList: result.internalDepartments,
            sectorsList:result.sectors
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
            parentDepartmentsList: result.internalDepartments,
            sectorsList:result.sectors
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
            parentDepartmentsList: result.internalDepartments,
            sectorsList:result.sectors
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
