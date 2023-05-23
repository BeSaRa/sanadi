import { TeamService } from './../../../services/team.service';
import { InternalDepartmentService } from './../../../services/internal-department.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ReassignTaskPopupComponent } from '@app/administration/popups/reassign-task-popup/reassign-task-popup.component';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { QueryResult } from '@app/models/query-result';
import { QueryResultSet } from '@app/models/query-result-set';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { EmployeeService } from '@app/services/employee.service';
import { ExternalUserService } from '@app/services/external-user.service';
import { LangService } from '@app/services/lang.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap, take } from 'rxjs/operators';
import { DialogService } from './../../../services/dialog.service';
import { InboxService } from './../../../services/inbox.service';
import { InternalUserService } from './../../../services/internal-user.service';
import { ProfileService } from '@app/services/profile.service';
import { CommonService } from '@app/services/common.service';
import { UserInboxTypes } from '@app/enums/user-inobx-types.enum.ts';
import { LangType } from '@app/types/types';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { UserTypes } from '@app/enums/user-types.enum';
import { ExternalUser } from '@app/models/external-user';
import { InternalUser } from '@app/models/internal-user';
import { UserTeam } from '@app/models/user-team';

@Component({
  selector: 'manage-user-inbox',
  templateUrl: 'manage-user-inbox.component.html',
  styleUrls: ['manage-user-inbox.component.scss']
})
export class ManageUserInboxComponent implements OnInit, OnDestroy {

  users: any[] = [];
  destroy$: Subject<any> = new Subject<any>();
  userControl: UntypedFormControl = new UntypedFormControl();
  teamsControl: UntypedFormControl = new UntypedFormControl();
  userTypesControl: UntypedFormControl = new UntypedFormControl();
  columns = ['BD_FULL_SERIAL', 'BD_SUBJECT', 'BD_CASE_TYPE', 'action', 'PI_CREATE', 'ACTIVATED', 'PI_DUE', 'fromUserInfo', 'actions'];
  queryResultSet?: QueryResultSet;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  isInternal: boolean = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter(x => (x.lookupKey !== UserTypes.INTEGRATION_USER && x.lookupKey !== UserTypes.ALL));
  userTeams:UserTeam[] = [];
  @ViewChild('table') table!: TableComponent;

  constructor(
    public lang: LangService,
    private internalUserService: InternalUserService,
    private externalUserService: ExternalUserService,
    private employeeService: EmployeeService,
    private profileService: ProfileService,
    private internalDepartmentService: InternalDepartmentService,
    private lookupService: LookupService,
    private commonService: CommonService,
    private teamService:TeamService,
    private inboxService: InboxService,
    private dialogService: DialogService
  ) {
    this.isInternal = this.employeeService.getCurrentUser().isInternal();
  }
  actions: IMenuItem<QueryResult>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: QueryResult) => this.assignToUser(item)
    },

  ];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
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
      this._openReassignPopup()
        .onAfterClose$.subscribe((domainName?: string) => {
          if (domainName) {
            this.inboxService.reassignBulk(this.selectedRecords, domainName)
              .pipe(take(1))
              .subscribe();
          }
        });
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
  loadInternalEmployees(){
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
    if(this.employeeService.getCurrentUser().isExternal()){
      this._loadCurrentUserTeams();
      this._listenToTeamSelect();
    }
  }

  private _listenToUserSelect() {
    this.userControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        //tap(user=>this._loadAllowedUsers(user))
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
  // private _loadAllowedUsers(selectedUser:InternalUser|ExternalUser){


  //   if(selectedUser  instanceof ExternalUser){
  //     this.commonService.loadExternalAssignUsers(selectedUser.getProfileId()!)
  //     .pipe(
  //       take(1),
  //       tap(console.log)
  //     ).subscribe();
  //   }
  //   if( selectedUser  instanceof InternalUser){
  //     this.commonService.loadInternalAssignUsers((selectedUser as InternalUser).defaultDepartmentId)
  //     .pipe(
  //       take(1),
  //       tap(console.log)
  //     ).subscribe();
  //   }
  // }
  private _listenToUserTypeSelect() {
    this.userTypesControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((userType:number) => {
          if(userType === UserTypes.EXTERNAL){
            this.loadExternalEmployees()
          }
          if( userType === UserTypes.INTERNAL){
            this.loadInternalEmployees()
          }
        })
      ).subscribe()
  }
  private _listenToTeamSelect() {
    this.teamsControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        switchMap((teamId:number) => {
          return this.teamService.loadTeamMembers(teamId)
          .pipe(
            take(1),
            tap(internalUsers=>{
              this.users = internalUsers
            }),
            catchError(_=>{
              this.users = [];
              return of([]);
            })
          )
        })
      ).subscribe()
  }

  private _loadCurrentUserTeams(){
    this.teamService.loadUserTeamsByUserId(this.employeeService.getCurrentUser().generalUserId)
    .pipe(
      takeUntil(this.destroy$),
      tap(userTeams=>{
        this.userTeams = userTeams
      })
    ).subscribe();
  }

  private assignToUser(queryResult: QueryResult) {
    this._openReassignPopup()
      .onAfterClose$
      .pipe(
        take(1),
         switchMap(domainName=>{
         return this.inboxService.reassignBulk([queryResult],domainName)
         })
      ).subscribe();
  }
  private _openReassignPopup() {
    return this.dialogService.show<IDialogData<any>>(ReassignTaskPopupComponent, {
      model: this.users,
      operation: OperationTypes.UPDATE
    })
  }
}
