import { UserClickOn } from '@app/enums/user-click-on.enum';
import { SubTeamService } from '@app/services/sub-team.service';
import { SubTeam } from '@app/models/sub-team';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { ToastService } from '@app/services/toast.service';
import { InternalUser } from '@app/models/internal-user';
import { ExternalUser } from '@app/models/external-user';
import { of, Subject } from 'rxjs';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { map, switchMap, takeUntil, filter } from 'rxjs/operators';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogService } from '@app/services/dialog.service';
import { SharedService } from '@app/services/shared.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserSubTeam } from '@app/models/user-sub-team';

@Component({
  selector: 'user-sub-team',
  templateUrl: './user-sub-team.component.html',
  styleUrls: ['./user-sub-team.component.scss']
})
export class UserSubTeamComponent implements OnInit, OnDestroy {
  selectedTeamsIds: number[] = [];
  get displayedColumns(): string[] {
    return this.readonly ? ['arName', 'enName', 'status'] : ['checkbox', 'arName', 'enName', 'status', 'actions'];
  }
  filterControl: UntypedFormControl = new UntypedFormControl();
  selectedTeamControl: UntypedFormControl = new UntypedFormControl();
  userSubTeams: UserSubTeam[] = [];
  commonStatusEnum = CommonStatusEnum;
  userSubTeamsChanged$: Subject<UserSubTeam[]> = new Subject<UserSubTeam[]>();
  @Input()
  subTeams: SubTeam[] = [];
  @Input()
  readonly: boolean = false;
  @Input()
  operation!: OperationTypes;
  @Input()
  model!: InternalUser | ExternalUser;
  @ViewChild(TableComponent)
  teamsTable!: TableComponent;
  destroy$: Subject<void> = new Subject();

  actions: IGridAction[] = [
    {
      langKey: 'btn_delete',
      callback: _ => {
        this.deleteBulkUserSubTeams();
      },
      icon: 'mdi mdi-delete'
    }
  ]

  constructor(public lang: LangService,
    private toast: ToastService,
    private dialog: DialogService,
    private sharedService: SharedService,
    public subTeamService: SubTeamService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToUserSubTeamsChange();
    if (this.operation !== OperationTypes.CREATE) {
      this.loadUserSubTeams();
    }
  }

  private listenToUserSubTeamsChange() {
    this.userSubTeamsChanged$
      .pipe(map(userSubTeams => this.userSubTeams = userSubTeams))
      .subscribe((userSubTeams) => {
        this.selectedTeamsIds = userSubTeams.map(userSubTeam => userSubTeam.subTeamId);
      });
  }

  loadUserSubTeams(): void {
    this.subTeamService
      .loadUserSubTeamsByUserId(this.model.generalUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((userSubTeams) => this.userSubTeamsChanged$.next(userSubTeams))
  }

  SubTeamExistsBefore(subTeam: SubTeam): boolean {
    return this.selectedTeamsIds.includes(subTeam.id);
  }

  addUserSubTeam(): void {
    if (!this.selectedTeamControl.value) {
      this.toast.error(this.lang.map.please_select_team_to_link);
      return;
    }
    // add sub team to the user
    const subTeam = new UserSubTeam().clone({
      generalUserId: this.model.generalUserId,
      subTeamId: this.selectedTeamControl.value.id,
      arName: this.selectedTeamControl.value.arName,
      enName: this.selectedTeamControl.value.enName,
    })
    this.subTeamService
      .createSubTeamUserLink(subTeam)
      .subscribe(() => {
        const st = this.subTeams.find(st => st.id == this.selectedTeamControl.value.id);
        const uSubTeam = subTeam.clone(
          { id: st?.id, status: st?.status, arName: st?.arName, enName: st?.enName })
        this.userSubTeamsChanged$.next(this.userSubTeams.concat([uSubTeam]));
        this.toast.success(this.lang.map.msg_create_x_success.change({ x: uSubTeam.getName() }))
        this.selectedTeamControl.setValue(null);
      });
  }

  deleteBulkUserSubTeams(): void {
    if (!this.teamsTable.selection.hasValue()) {
      return;
    }
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_selected))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(map((_) => {
        return this.teamsTable.selection.selected.map<number>(userSubTeam => userSubTeam.id)
      }))
      .pipe(switchMap(ids => this.subTeamService.deleteUserSubTeamBulk(ids)))
      .pipe(map(result => this.sharedService.mapBulkResponseMessages(this.teamsTable.selection.selected, 'id', result)))
      .subscribe(() => {
        // TODO: delete anything related to deleted teams from next tab
        const ides = this.teamsTable.selection.selected.map(i => i.id);
        this.teamsTable && this.teamsTable.clearSelection();
        this.userSubTeamsChanged$.next(this.userSubTeams.filter(uSubTeam => !ides.includes(uSubTeam.id)));
      });
  }

  toggleSubTeamUser(userSubTeam: UserSubTeam): void {
    userSubTeam.toggleStatus()
      .subscribe(() => {
        let updatedTeams = this.userSubTeams.map(x => {
          if (x.id === userSubTeam.id) {
            x.status = 1 - userSubTeam.status; // toggling 1 and 0
          }
          return x;
        })
        this.userSubTeamsChanged$.next(updatedTeams);
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: userSubTeam.getName() }));
      }
      )
  }

  deleteUserSubTeam(userSubTeam: UserSubTeam): void {
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({ x: userSubTeam.getName() })))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(switchMap(_ => userSubTeam.delete()))
      .subscribe((result) => {
        // TODO : delete anything related to the subTeamId with the current user in the nex tab
        if (result) {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: userSubTeam.getName() }))
          this.userSubTeamsChanged$.next(this.userSubTeams.filter(uSubTeam => uSubTeam.id !== userSubTeam.id))
        } else {
          this.toast.error(this.lang.map.msg_delete_fail.change({ x: userSubTeam.getName() }))
        }
      })
  }

}
