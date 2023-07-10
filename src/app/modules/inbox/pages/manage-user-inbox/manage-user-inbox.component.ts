import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserTypes } from '@app/enums/user-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Lookup } from '@app/models/lookup';
import { QueryResult } from '@app/models/query-result';
import { QueryResultSet } from '@app/models/query-result-set';
import { UserTeam } from '@app/models/user-team';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ReassignTaskPopupComponent } from '@app/modules/inbox/popups/reassign-task-popup/reassign-task-popup.component';
import { CommonService } from '@app/services/common.service';
import { EmployeeService } from '@app/services/employee.service';
import { ExternalUserService } from '@app/services/external-user.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ProfileService } from '@app/services/profile.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap, filter, map } from 'rxjs/operators';
import { DialogService } from '../../../../services/dialog.service';
import { InboxService } from '../../../../services/inbox.service';
import { InternalDepartmentService } from '../../../../services/internal-department.service';
import { InternalUserService } from '../../../../services/internal-user.service';
import { TeamService } from '../../../../services/team.service';
import { ExternalUser } from '@app/models/external-user';
import { InternalUser } from '@app/models/internal-user';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { Profile } from '@app/models/profile';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { Team } from '@app/models/team';

@Component({
  selector: 'manage-user-inbox',
  templateUrl: 'manage-user-inbox.component.html',
  styleUrls: ['manage-user-inbox.component.scss']
})
export class ManageUserInboxComponent implements OnInit, OnDestroy {

  users: (ExternalUser | InternalUser)[] = [];
  destroy$: Subject<any> = new Subject<any>();
  reload$: Subject<any> = new Subject<any>();
  userControl: UntypedFormControl = new UntypedFormControl();
  teamsControl: UntypedFormControl = new UntypedFormControl();
  profileControl: UntypedFormControl = new UntypedFormControl();
  userTypesControl: UntypedFormControl = new UntypedFormControl();
  columns = ['rowSelection', 'BD_FULL_SERIAL', 'BD_SUBJECT', 'BD_CASE_TYPE', 'action', 'PI_CREATE', 'ACTIVATED', 'PI_DUE', 'fromUserInfo', 'actions'];
  queryResultSet?: QueryResultSet;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  isInternal: boolean = true;
  userTypes: Lookup[] = [];
  userTeams: Team[] = [];
  selectedUser?: ExternalUser | InternalUser;
  profiles: Profile[] = [];
  isSuperAdmin: boolean = false;
  @ViewChild('table') table!: TableComponent;

  constructor(
    public lang: LangService,
    private internalUserService: InternalUserService,
    private externalUserService: ExternalUserService,
    private employeeService: EmployeeService,
    private lookupService: LookupService,
    private teamService: TeamService,
    private inboxService: InboxService,
    private dialogService: DialogService,
    private profileService: ProfileService
  ) {

  }
  actions: IMenuItem<QueryResult>[] = [
    // edit
    {
      type: 'action',
      label: 'reassign_task',
      icon: ActionIconsEnum.REASSIGN,
      show: (item: QueryResult) => !item.BD_IS_REASSIGNED,
      onClick: (item: QueryResult) => this.assignToUser(item)
    },
    // reassigned
    {
      type: 'action',
      label: 'reassigned_task',
      icon: ActionIconsEnum.REASSIGNED,
      show: (item: QueryResult) => item.BD_IS_REASSIGNED,

    },

  ];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'reassign_task',
      icon: ActionIconsEnum.REASSIGN,
      callback: ($event: MouseEvent) => {
        this._reassignBulk($event);
      }
    }
  ];
  get selectedRecords(): QueryResult[] {
    return this.table.selection.selected;
  }
  private _reassignBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this._openReassignPopup(this.selectedRecords);
    }
  }
  getService() {
    return this.employeeService.getCurrentUser().isInternal() ? this.internalUserService : this.externalUserService;

  }
  loadExternalEmployees() {
    this.externalUserService.loadActive()
      .pipe(
        takeUntil(this.destroy$),
        tap(users => {
          this.users = users;
        })
      ).subscribe()
  }
  loadInternalEmployees() {
    this.internalUserService.loadActive()
      .pipe(
        takeUntil(this.destroy$),
        tap(users => {
          this.users = users;
        })
      ).subscribe()

  }
  getServiceName(service: number) {
    let serviceKey: keyof ILanguageKeys;
    try {
      serviceKey = this.inboxService.getService(service).serviceKey;
    } catch (e) {
      return '';
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this._listenToUserSelect();
    this._listenToUserTypeSelect();
    this._initializeComponentValues();
    // if (this.employeeService.getCurrentUser().isExternal()) {
    //   //this._loadCurrentUserTeams();
    // }
    this._listenToTeamSelect();
    this._listenToReload();
  }

  private _initializeComponentValues() {
    this.isInternal = this.employeeService.getCurrentUser().isInternal();
    this.isSuperAdmin = this.employeeService.checkPermissions(PermissionsEnum.SUPER_ADMIN);
    // this.isSuperAdmin = true;
    const userType = this.employeeService.getCurrentUser().userType;
    if (this.isSuperAdmin) {
      this.userTypes = this.lookupService.listByCategory.UserType
        .filter(x => (x.lookupKey !== UserTypes.INTEGRATION_USER && x.lookupKey !== UserTypes.ALL));

    } else {
      this.userTypes = this.lookupService.listByCategory.UserType
        .filter(x => (x.lookupKey === userType));
      this.userTypesControl.setValue(userType);

    }
    this.userTeams = this.employeeService.teams.filter(x => x.id !== -1);
  }
  private _listenToUserSelect() {
    this.userControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(_ => {
          this.table?.selection.clear();
          this.queryResultSet = new QueryResultSet()
        }),
        filter(user => !!user),
        tap((user: ExternalUser | InternalUser) => {
          this.selectedUser = this._getSelectedUserWithType(user);
        }),
        switchMap((user) => {
          return this.inboxService.loadUserInboxByDomainName(user.domainName)
            .pipe(
              tap((queryResultSet: QueryResultSet) => {
                this.queryResultSet = queryResultSet;
              }),
              catchError(_ => {
                return of(null);
              })
            )
        })
      ).subscribe()

  }
  private _listenToUserTypeSelect() {
    this.userTypesControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(_ => this.userControl.reset()),
        tap((userType: number) => {
          this.users = [];
          if (userType === UserTypes.EXTERNAL) {
            this._loadProfiles();
          }
          if (userType === UserTypes.INTERNAL) {
            // this.loadInternalEmployees()
            this._loadTeams();
          }
        })
      ).subscribe()
  }
  private _listenToTeamSelect() {
    this.teamsControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(_ => this.userControl.reset()),

        switchMap((teamId: number) => {
          return this.teamService.loadActiveTeamMembers(teamId)
            .pipe(
              take(1),
              tap(internalUsers => {
                this.users = internalUsers
              }),
              catchError(_ => {
                this.users = [];
                return of([]);
              })
            )
        })
      ).subscribe()
  }

  // private _loadCurrentUserTeams() {
  //   this.teamService.loadUserTeamsByUserId(this.employeeService.getCurrentUser().generalUserId)
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       tap(userTeams => {
  //         this.userTeams = userTeams
  //       })
  //     ).subscribe();
  // }

  private _loadTeams() {
    if (this.isSuperAdmin) {
      this.teamService.loadAsLookups()
        .pipe(
          takeUntil(this.destroy$),
          tap(userTeams => {
            this.userTeams = userTeams
          })
        ).subscribe();
    }
    else {
      this.userTeams = this.employeeService.teams.filter(x => x.id !== -1);
    }
  }


  private assignToUser(queryResult: QueryResult) {
    this._openReassignPopup([queryResult]);

  }
  private _getQueryId(selectedUser:InternalUser|ExternalUser):number{
    if(selectedUser.userType === UserTypes.INTERNAL){
      return this.userTeams.find(x=>x.id === this.teamsControl.value)?.parentDeptId!
    }
    if(selectedUser.userType === UserTypes.EXTERNAL){
      return this.selectedUser?.getProfileId()!
    }
    return 0;
  }
  private _openReassignPopup(selectedTasks: QueryResult[]) {
    return this.dialogService.show<IDialogData<{
      user: InternalUser | ExternalUser,
      tasks: QueryResult[],
      queryId:number
    }>>(ReassignTaskPopupComponent, {
      model: {
        user: this.selectedUser!,
        tasks: selectedTasks,
        queryId :this._getQueryId(this.selectedUser!)
      },
      operation: OperationTypes.UPDATE
    })
      .onAfterClose$
      .pipe(
        take(1),
        filter(domainName => !!domainName),
        switchMap(domainName => {
          return this.inboxService.reassignBulk(selectedTasks, domainName)
        }),
        tap(_ => this.reload$.next())
      ).subscribe();
  }
  private _getSelectedUserWithType(user: ExternalUser | InternalUser) {
    return user.userType === UserTypes.EXTERNAL ? new ExternalUser().clone({
      ...user as ExternalUser,
      profileId: this._getSelectedUserProfileId()
    }) :
      user as InternalUser;
  }
  private _getSelectedUserProfileId() {
    return this.profileControl.value?.id ?? this.employeeService.getProfile()?.id
  }
  private _listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter(_ => !!this.userControl.value),
      switchMap(_ => {
        return this.inboxService.loadUserInboxByDomainName(this.userControl.value.domainName)
          .pipe(
            tap((queryResultSet: QueryResultSet) => {
              this.queryResultSet = queryResultSet;
            }),
            catchError(_ => {
              return of(null);
            })
          )
      })
    ).subscribe();
  }
  isExternalUsers() {
    return this.isInternal && this.userTypesControl.value === UserTypes.EXTERNAL;
  }
  isAllowedToSelectTeam() {
    if (this.isInternal && this.userTypesControl.value !== UserTypes.INTERNAL) {
      return false;
    }
    return true;
  }
  private _loadProfiles() {
    this.profileService.loadActive()
      .pipe(
        take(1),
        tap(profiles => {
          this.profiles = profiles
        })
      ).subscribe(_ => {
        this._listenToProfileSelect();
      })
  }

  private _listenToProfileSelect() {
    this.profileControl.valueChanges
      .pipe(
        switchMap((profile: Profile) =>
          this._loadExternalUsersByProfile(profile)
        ),
        tap(users => {
          this.userControl.reset();
          this.users = users
        }),
        takeUntil(this.destroy$)
      ).subscribe();
  }
  private _loadExternalUsersByProfile(profile: Profile) {
    return this.externalUserService.getByProfileCriteria({
      'profile-id': profile.id
    })
  }
}
