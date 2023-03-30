import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {TeamService} from '@services/team.service';
import {FollowupPermissionService} from '@services/followup-permission.service';
import {of, Subject} from 'rxjs';
import {Team} from '@models/team';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {InternalUser} from '@models/internal-user';
import {UntypedFormControl} from '@angular/forms';
import {CommonStatusEnum} from '@enums/common-status.enum';
import {FollowupPermission} from '@models/followup-permission';
import {AdminResult} from '@models/admin-result';
import {ActionIconsEnum} from '@enums/action-icons-enum';

@Component({
  selector: 'user-followup-permission-new',
  templateUrl: './user-followup-permission-new.component.html',
  styleUrls: ['./user-followup-permission-new.component.scss']
})
export class UserFollowupPermissionNewComponent implements OnInit, OnDestroy {
  destroy$: Subject<any> = new Subject<any>();
  actionIconsEnum = ActionIconsEnum;

  constructor(public lang: LangService,
              private toast: ToastService,
              private teamService: TeamService,
              private followupPermissionService: FollowupPermissionService) {

  }

  ngOnInit(): void {
    this.loadTeams();
    this.listenToReload();
    // this.reloadUserFollowupPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  commonStatusEnum = CommonStatusEnum;
  displayedColumns: string[] = ['arName', 'enName', 'externalFollowup', 'internalFollowup'];
  teamsList: Team[] = [];
  @Input() readonly: boolean = false;
  @Input() user!: InternalUser;

  selectedTeamControl: UntypedFormControl = new UntypedFormControl();
  filterControl: UntypedFormControl = new UntypedFormControl();
  reload$: Subject<number> = new Subject<number>();
  userFollowupPermissions: FollowupPermission[] = [];
  teamsMap: Record<number, Team> = {};

  private loadTeams(): void {
    this.teamService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .pipe(map(result => {
        return result.filter(item => item.parentDeptId > -1);
      }))
      .subscribe((teams) => {
        this.teamsList = teams;
        this.teamsList.forEach((team) => this.teamsMap[team.id] = team);
      });
  }

  reloadUserFollowupPermissions(): void {
    this.reload$.next(this.user.generalUserId);
  }

  addUserFollowupPermission(): void {
    if (!this.selectedTeamControl.value) {
      this.toast.error(this.lang.map.please_select_team_to_link);
      return;
    }
    const value: FollowupPermission = new FollowupPermission().clone({
      generalUserId: this.user.generalUserId,
      teamId: this.selectedTeamControl.value.id,
      hasInternal: true,
      hasExternal: true,
      teamInfo: AdminResult.createInstance(this.selectedTeamControl.value)
    }).denormalize();
    this.followupPermissionService.create(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((userFollowupPermission) => {
        userFollowupPermission.teamInfo = this.getTeamInfo(userFollowupPermission.teamId);
        this.toast.success(this.lang.map.msg_create_x_success.change({x: userFollowupPermission.teamInfo.getName()}))
        this.selectedTeamControl.setValue(null);
        this.reloadUserFollowupPermissions();
      })
  }

  getTeamInfo(teamId: number): AdminResult {
    return AdminResult.createInstance(this.teamsMap[teamId] ?? {});
  }

  teamExistsBefore(team: Team): boolean {
    return this.userFollowupPermissions.some(item => item.teamId === team.id);
  }

  private listenToReload(): void {
    this.reload$
      // .pipe(delay(0))
      .pipe(filter(id => !!id))
      .pipe(switchMap(id => this.followupPermissionService.getFollowupPermissionsByGeneralUserId(id)))
      .pipe(tap(items => {
        this.userFollowupPermissions = items;
      }))
      /*.pipe(tap(_ => this.updatePermissionMap()))
      .pipe(tap(_ => this.updateUserTeamMap()))
      .pipe(map(_ => this.getFollowupPermissions()))*/
      .subscribe()
  }

  deleteUserFollowupPermission(userFollowPermissionId: number) {
    return this.followupPermissionService.deleteBulk([userFollowPermissionId]);
  }

  updateSwitch(item: FollowupPermission, property: "hasInternal" | 'hasExternal', $event: Event): void {
    if (!item.id) {
      return;
    }
    const userFollowupPermission = new FollowupPermission().clone(item);
    userFollowupPermission.toggleProperty(property);

    if (!userFollowupPermission.hasExternal && !userFollowupPermission.hasInternal) {
      this.deleteUserFollowupPermission(userFollowupPermission.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: item.teamInfo.getName()}));
          this.reloadUserFollowupPermissions();
        });
      return;
    }
    item.toggleProperty(property).save()
      .pipe(takeUntil(this.destroy$))
      .pipe(
        catchError(() => {
          item.toggleProperty(property);
          this._setTeamInfo(item);
          return of(null);
        }))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this._setTeamInfo(item);
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: item.teamInfo.getName()}))
      })
  }

  private _setTeamInfo(userFollowupPermission: FollowupPermission): void {
    userFollowupPermission.teamInfo = this.getTeamInfo(userFollowupPermission.teamId);
    userFollowupPermission.denormalize();
  }
}
