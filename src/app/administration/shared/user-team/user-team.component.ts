import { SubTeamService } from '@app/services/sub-team.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { Team } from '@app/models/team';
import { UserTeam } from '@app/models/user-team';
import { AdminResult } from '@app/models/admin-result';
import { TeamService } from '@app/services/team.service';
import { ToastService } from '@app/services/toast.service';
import { InternalUser } from '@app/models/internal-user';
import { ExternalUser } from '@app/models/external-user';
import { iif, of, Subject } from 'rxjs';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { filter, map, share, switchMap, takeUntil } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogService } from '@app/services/dialog.service';
import { SharedService } from '@app/services/shared.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { TeamSecurityConfigurationService } from '@app/services/team-security-configuration.service';
import { UserSecurityConfigurationService } from '@app/services/user-security-configuration.service';
import { TeamSecurityConfiguration } from '@app/models/team-security-configuration';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { SubTeam } from '@app/models/sub-team';

@Component({
  selector: 'user-team',
  templateUrl: './user-team.component.html',
  styleUrls: ['./user-team.component.scss']
})
export class UserTeamComponent implements OnInit, OnDestroy {
  selectedTeamsIds: number[] = [];
  get displayedColumns(): string[] {
    return this.readonly ? ['arName', 'enName', 'status'] : ['checkbox', 'arName', 'enName', 'status', 'actions'];
  }
  filterControl: UntypedFormControl = new UntypedFormControl();
  selectedTeamControl: UntypedFormControl = new UntypedFormControl();
  teams: Team[] = [];
  userTeams: UserTeam[] = [];
  subTeamsListBasedOnUserTeams: SubTeam[] = [];
  commonStatusEnum = CommonStatusEnum;
  userTeamsChanged$: Subject<UserTeam[]> = new Subject<UserTeam[]>();
  @Input()
  readonly: boolean = false;
  @Input()
  operation!: OperationTypes;
  @Input()
  model!: InternalUser | ExternalUser;
  @ViewChild(TableComponent)
  teamsTable!: TableComponent;
  destroy$: Subject<any> = new Subject<any>();

  actions: IGridAction[] = [
    {
      langKey: 'btn_delete',
      callback: _ => {
        this.deleteBulkUserTeams();
      },
      icon: 'mdi mdi-delete'
    }
  ]

  constructor(public lang: LangService,
    private toast: ToastService,
    private dialog: DialogService,
    private sharedService: SharedService,
    private teamSecurityService: TeamSecurityConfigurationService,
    private userSecurityService: UserSecurityConfigurationService,
    private subTeamService: SubTeamService,
    public teamService: TeamService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTeams();
    this.listenToUserTeamsChange();
    if (this.operation !== OperationTypes.CREATE) {
      this.loadUserTeams();
    }
  }

  private listenToUserTeamsChange() {
    this.userTeamsChanged$
      .pipe(map(userTeams => this.userTeams = userTeams))
      .pipe(
        switchMap((userTeams) => {
          this.selectedTeamsIds = userTeams.map(userTeam => userTeam.teamId);
          return this.subTeamService.loadFilterByMainTeamAsLookups(this.selectedTeamsIds)
        })
      )
      .subscribe((subTeams) => {
        this.subTeamsListBasedOnUserTeams = subTeams;
      });
  }

  loadTeams(): void {
    this.teamService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .pipe(map(result => {
        return this.model.isInternal() ? result.filter(item => item.parentDeptId > -1) : result;
      }))
      .subscribe((teams) => this.teams = teams);
  }

  loadUserTeams(): void {
    this.teamService
      .loadUserTeamsByUserId(this.model.generalUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((userTeams) => this.userTeamsChanged$.next(userTeams))
  }

  teamExistsBefore(team: Team): boolean {
    return this.selectedTeamsIds.includes(team.id);
  }

  addUserTeam(): void {
    if (!this.selectedTeamControl.value) {
      this.toast.error(this.lang.map.please_select_team_to_link);
      return;
    }
    // add team to the user
    const addTeam$ = this.teamService
      .createTeamUserLink(new UserTeam().clone({
        generalUserId: this.model.generalUserId,
        teamId: this.selectedTeamControl.value.id,
        teamInfo: AdminResult.createInstance(this.selectedTeamControl.value)
      }).denormalize())
      .pipe(share())

    addTeam$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userTeam) => {
        this.toast.success(this.lang.map.msg_create_x_success.change({ x: userTeam.teamInfo.getName() }))
        this.userTeamsChanged$.next(this.userTeams.concat([userTeam]));
        this.selectedTeamControl.setValue(null);
      });

    const insertUserSecurity$ = (teamSecurity: TeamSecurityConfiguration[]) => this.userSecurityService.createBulk(teamSecurity.map(item => item.convertToUserSecurity(this.model.generalUserId)))

    addTeam$
      // load the team security by id
      .pipe(switchMap((userTeam) => this.teamSecurityService.loadSecurityByTeamId(userTeam.teamId)))
      // insert default user security
      .pipe(switchMap((teamSecurity) => iif(() => !!teamSecurity.length, insertUserSecurity$(teamSecurity), of([]))))
      .pipe(takeUntil(this.destroy$))
      .subscribe()

  }

  deleteBulkUserTeams(): void {
    if (!this.teamsTable.selection.hasValue()) {
      return;
    }
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_selected))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(map((_) => {
        return this.teamsTable.selection.selected.map<number>(userTeam => userTeam.id)
      }))
      .pipe(switchMap(ids => this.teamService.deleteUserTeamBulk(ids)))
      .pipe(map(result => this.sharedService.mapBulkResponseMessages(this.teamsTable.selection.selected, 'id', result)))
      .subscribe(() => {
        // TODO: delete anything related to deleted teams from next tab
        const ides = this.teamsTable.selection.selected.map(i => i.id);
        this.teamsTable && this.teamsTable.clearSelection();
        this.userTeamsChanged$.next(this.userTeams.filter(uTeam => !ides.includes(uTeam.id)));
      });
  }

  toggleTeamUser(userTeam: UserTeam): void {
    userTeam.toggleStatus()
      .subscribe(() => {
        let updatedTeams = this.userTeams.map(x => {
          if (x.id === userTeam.id) {
            x.status = 1 - userTeam.status; // toggling 1 and 0
          }
          return x;
        })
        this.userTeamsChanged$.next(updatedTeams);
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: userTeam.teamInfo.getName() }));
      }
      )
  }

  deleteUserTeam(userTeam: UserTeam): void {
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({ x: userTeam.teamInfo.getName() })))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(switchMap(_ => userTeam.delete()))
      .subscribe((result) => {
        // TODO : delete anything related to the teamId with the current user in the nex tab
        if (result) {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: userTeam.teamInfo.getName() }))
          this.userTeamsChanged$.next(this.userTeams.filter(uTeam => uTeam.id !== userTeam.id))
        } else {
          this.toast.error(this.lang.map.msg_delete_fail.change({ x: userTeam.teamInfo.getName() }))
        }
      })
  }

}
