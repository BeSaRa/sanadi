import { Component, Input, OnInit } from '@angular/core';
import { UserTeam } from "@app/models/user-team";
import { UntypedFormControl } from "@angular/forms";
import { LangService } from "@services/lang.service";
import { FollowupPermissionService } from "@services/followup-permission.service";
import { InternalUser } from "@app/models/internal-user";
import { Observable, Subject } from "rxjs";
import { delay, filter, map, switchMap, tap } from "rxjs/operators";
import { FollowupPermission } from "@app/models/followup-permission";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'user-followup-permission',
  templateUrl: './user-followup-permission.component.html',
  styleUrls: ['./user-followup-permission.component.scss']
})
export class UserFollowupPermissionComponent implements OnInit {
  displayedColumns: string[] = ['arName', 'enName', 'externalFollowup', 'internalFollowup'];
  filterControl: UntypedFormControl = new UntypedFormControl();
  reload$: Subject<number> = new Subject<number>();
  @Input()
  readonly: boolean = false;
  @Input()
  userTeams: UserTeam[] = []
  @Input()
  user!: InternalUser
  followupPermissions: FollowupPermission[] = []
  followupPermissionMap: Record<number, FollowupPermission> = {}
  userTeamsMap: Record<number, UserTeam> = {}

  constructor(public lang: LangService,
              private toast: ToastService,
              private followupPermissionService: FollowupPermissionService) {}

  ngOnInit(): void {
    this.listenToReload()
    this.reload$.next(this.user.generalUserId)
  }


  private listenToReload(): void {
    this.reload$
      .pipe(delay(0))
      .pipe(filter(id => !!id))
      .pipe(switchMap(id => this.followupPermissionService.getFollowupPermissionsByGeneralUserId(id)))
      .pipe(tap(items => {
        this.followupPermissions = items
      }))
      .pipe(tap(_ => this.updatePermissionMap()))
      .pipe(tap(_ => this.updateUserTeamMap()))
      .pipe(map(_ => this.getFollowupPermissions()))
      .subscribe()
  }

  private getFollowupPermissions(): Observable<FollowupPermission[]> {
    const permissions = this.followupPermissions.map(item => item.teamId);
    const userTeamIds = this.userTeams.map(item => item.teamId)
    const observable$ = new Subject<FollowupPermission[]>();
    if (permissions.length > userTeamIds.length) {
      // delete the extra ids
      const ids = this.getDifference(permissions, userTeamIds)
      this.followupPermissionService
        .deleteBulk(ids)
        .pipe(tap((ids) => this.removeExtraIdsFromMap(Object.keys(ids) as unknown as number[])))
        .subscribe(() => observable$.next(this.mapTeamToPermissions()))

    } else if (permissions.length < userTeamIds.length) {
      // add extra ids
      const ids = this.getDifference(userTeamIds, permissions);
      this.followupPermissionService
        .createBulk(ids.map(id => {
          const userTeam = this.userTeamsMap[id]
          return new FollowupPermission().clone({
            teamId: userTeam.teamId,
            generalUserId: this.user.generalUserId,
            hasExternal: false,
            hasInternal: false,
            teamInfo: userTeam.teamInfo
          })
        }))
        .pipe(tap(items => this.appendToFollowupPermissionMap(items.map(item => {
          item.teamInfo = this.userTeamsMap[item.teamId].teamInfo;
          return item
        }))))
        .subscribe(() => observable$.next(this.mapTeamToPermissions()))
    }
    return observable$
  }

  private getDifference(first: number[], second: number[]): number[] {
    return first.filter(item => !second.includes(item))
  }

  private updatePermissionMap(): void {
    this.followupPermissions.forEach(item => {
      this.followupPermissionMap[item.teamId] = item
    })
  }

  private removeExtraIdsFromMap(ids: number[]): void {
    ids.forEach(id => {
      delete this.followupPermissionMap[id]
    })
  }

  private mapTeamToPermissions(): FollowupPermission[] {
    return this.userTeams.map(item => this.followupPermissionMap[item.teamId])
  }

  private updateUserTeamMap(): void {
    this.userTeams.forEach(item => this.userTeamsMap[item.teamId] = item)
  }

  private appendToFollowupPermissionMap(items: FollowupPermission[]): void {
    items.forEach(item => this.followupPermissionMap[item.teamId] = item)
    this.followupPermissions = Object.values(this.followupPermissionMap)
  }

  updateSwitch(row: FollowupPermission, property: "hasInternal" | 'hasExternal'): void {
    row.toggleProperty(property)
      .save()
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: row.teamInfo.getName() }))
      })
  }
}
