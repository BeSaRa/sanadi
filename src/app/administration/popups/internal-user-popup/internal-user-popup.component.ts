import {Component, Inject, ViewChild} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {InternalUser} from "@app/models/internal-user";
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {iif, Observable, of, Subject} from 'rxjs';
import {InternalDepartmentService} from "@app/services/internal-department.service";
import {InternalDepartment} from "@app/models/internal-department";
import {catchError, filter, map, share, switchMap, takeUntil, tap, withLatestFrom} from "rxjs/operators";
import {Lookup} from "@app/models/lookup";
import {LookupService} from '@app/services/lookup.service';
import {LookupCategories} from '@app/enums/lookup-categories';
import {CheckGroup} from "@app/models/check-group";
import {Permission} from "@app/models/permission";
import {PermissionService} from "@app/services/permission.service";
import {JobTitleService} from "@app/services/job-title.service";
import {JobTitle} from "@app/models/job-title";
import {CheckGroupHandler} from "@app/models/check-group-handler";
import {CustomRole} from "@app/models/custom-role";
import {CustomRoleService} from "@app/services/custom-role.service";
import {UserPermissionService} from "@app/services/user-permission.service";
import {ToastService} from "@app/services/toast.service";
import {TeamService} from "@app/services/team.service";
import {Team} from "@app/models/team";
import {UserTeam} from "@app/models/user-team";
import {TableComponent} from "@app/shared/components/table/table.component";
import {SharedService} from "@app/services/shared.service";
import {TeamSecurityConfigurationService} from "@app/services/team-security-configuration.service";
import {TeamSecurityConfiguration} from "@app/models/team-security-configuration";
import {UserSecurityConfiguration} from "@app/models/user-security-configuration";
import {UserSecurityConfigurationService} from "@app/services/user-security-configuration.service";
import {TabComponent} from "@app/shared/components/tab/tab.component";

@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent extends AdminGenericDialog<InternalUser> {
  operation: OperationTypes;
  model: InternalUser;
  form!: FormGroup;
  departments: InternalDepartment[] = [];
  jobTitles: JobTitle[] = [];
  statusList: Lookup[] = [];
  permissionGroups: CheckGroup<Permission>[] = [];
  groupHandler!: CheckGroupHandler<Permission>;
  customRoles: CustomRole[] = [];
  teams: Team[] = [];
  selectedUserTeam: FormControl = new FormControl();
  userTeams: UserTeam[] = [];
  userTeamsChanged$: Subject<UserTeam[]> = new Subject<UserTeam[]>();
  @ViewChild(TableComponent)
  teamsTable!: TableComponent;

  teamSecurityMap!: Record<number, TeamSecurityConfiguration>;

  teamSecurity: TeamSecurityConfiguration[] = [];
  userSecurity: UserSecurityConfiguration[] = [];
  userSecurityColumns: string[] = ['serviceName', 'add', 'search', 'teamInbox'];
  displaySaveBtn: boolean = true;

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private internalDep: InternalDepartmentService,
              public fb: FormBuilder,
              private teamService: TeamService,
              private sharedService: SharedService,
              private lookupService: LookupService,
              private jobTitleService: JobTitleService,
              private customRoleService: CustomRoleService,
              private userPermissionService: UserPermissionService,
              private permissionService: PermissionService,
              private teamSecurityService: TeamSecurityConfigurationService,
              private userSecurityService: UserSecurityConfigurationService,
              private toast: ToastService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
  }

  private loadJobTitles() {
    this.jobTitleService.load().subscribe((jobTitles) => this.jobTitles = jobTitles)
  }

  private loadDepartments(): void {
    this.internalDep.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((departments) => {
        this.departments = departments;
      });
  }

  get basicFormTab() {
    return this.form.get('user');
  }

  get permissionsFormTab() {
    return this.form.get('userPermissions');
  }

  get customRoleId() {
    return this.permissionsFormTab?.get('customRoleId');
  }

  get userCustomRoleId() {
    return this.basicFormTab?.get('customRoleId');
  }

  get userPermissions() {
    return this.permissionsFormTab?.get('permissions');
  }

  private onPermissionChanged(): void {
    this.groupHandler.getSelection().length ? this.updateUserPermissions(true) : this.updateUserPermissions(false);
  }

  private loadPermissions() {
    this.permissionService
      .load()
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(of(this.lookupService.getByCategory(LookupCategories.ORG_USER_PERMISSION_GROUP))))
      .pipe(switchMap(([permissions, groups]) => {
        this.buildPermissionGroups(groups, permissions);
        this.groupHandler = new CheckGroupHandler<Permission>(
          this.permissionGroups,
          () => this.onPermissionChanged(),
          () => this.onPermissionChanged()
        );
        return of(true);
      }))
      .pipe(switchMap(_ => this.model.id ? this.userPermissionService.loadUserPermissions(this.model.id) : of([])))
      .subscribe((userPermissions) => {
        this.groupHandler.setSelection(userPermissions.map(p => p.permissionId));
        this.onPermissionChanged();
      })

  }

  private buildPermissionGroups(groups: Lookup[], permissions: Permission[]): void {
    const permissionsByGroup = new Map<number, Permission[]>();
    this.permissionGroups = [];
    permissions.reduce((record, permission) => {
      return permissionsByGroup.set(permission.groupId, (permissionsByGroup.get(permission.groupId) || []).concat(permission));
    }, {} as any);
    groups.forEach(group => this.permissionGroups.push(new CheckGroup(group, permissionsByGroup.get(group.lookupKey) || [], [])));
  }

  private loadCustomRoles() {
    this.customRoleService
      .loadComposite()
      .pipe(takeUntil(this.destroy$))
      .subscribe((roles) => this.customRoles = roles);
  }


  private listenToTeamSecurityChange() {
    const selectedTeam$ = this.selectedUserTeam
      .valueChanges
      .pipe(share());

    const clear$ = selectedTeam$.pipe(takeUntil(this.destroy$), filter(value => !value));
    const selected$ = selectedTeam$.pipe(takeUntil(this.destroy$), filter(value => !!value));

    clear$
      .subscribe()

    const insertDefaultTeamSecurity$ = () => {
      const securityConfigurations = this.teamSecurity.map(t => t.convertToUserSecurity(this.model.generalUserId));
      return this.userSecurityService.createBulk(securityConfigurations).pipe(catchError(_ => of([])))
        .pipe(map(result => result.map((item, index) => {
          item.teamInfo = this.teamSecurity[index].teamInfo;
          item.serviceInfo = this.teamSecurity[index].serviceInfo;
          return item;
        })))
    }

    selected$
      .pipe(
        // get the team security configuration
        switchMap(teamId => this.teamSecurityService.loadSecurityByTeamId(teamId)),
        tap((teamSecurity) => this.teamSecurity = teamSecurity),
        // create team security map based on caseType to use it later in grid
        tap(_ => {
          this.teamSecurityMap = this.teamSecurity.reduce((acc, item) => {
            return {...acc, [item.caseType]: item}
          }, {}) || {}
        }),
        // get the user security configuration
        switchMap(() => this.userSecurityService.loadSecurityByTeamId(this.selectedUserTeam.value, this.model.generalUserId)),
        // if there is length for the user security configurations we have to display the right mapping on the view
        switchMap((userSecurity => iif(() => !userSecurity.length, insertDefaultTeamSecurity$(), of(userSecurity)))),
        tap((userSecurity) => this.userSecurity = userSecurity)
      )
      .subscribe((result) => console.log(result))
  }

  initPopup(): void {
    this.loadDepartments();
    this.loadJobTitles();
    this.loadPermissions();
    this.loadCustomRoles();
    this.loadTeams();
    this.listenToTeamSecurityChange();
    if (this.operation === OperationTypes.UPDATE) {
      this.loadUserTeams();
    }
  }

  destroyPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group({
      user: this.fb.group(this.model.buildForm(true)),
      userPermissions: this.fb.group({
        permissions: [false, Validators.requiredTrue],
        customRoleId: [this.model?.customRoleId, Validators.required]
      })
    });
  }

  afterSave(model: InternalUser, dialogRef: DialogRef): void {
    this.userPermissionService
      .saveUserPermissions(model.id, this.groupHandler.getSelection())
      .subscribe(() => {
        const message = (this.operation === OperationTypes.CREATE)
          ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        this.toast.success(message.change({x: model.getName()}));
        // here i closing the popup after click on save and the operation is update
        this.operation === OperationTypes.UPDATE && dialogRef.close(model);
        // here i change operation to UPDATE after first save
        this.operation === OperationTypes.CREATE && (this.operation = OperationTypes.UPDATE);
      });
  }

  beforeSave(model: InternalUser, form: FormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  prepareModel(model: InternalUser, form: FormGroup): InternalUser | Observable<InternalUser> {
    return (new InternalUser()).clone({...model, ...form.get('user')?.value});
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  basicInfoHasError() {
    return (this.basicFormTab!.invalid && (this.basicFormTab!.touched || this.basicFormTab!.dirty));
  }

  permissionTabHasError() {
    return (this.permissionsFormTab!.invalid && (this.permissionsFormTab!.touched || this.permissionsFormTab!.dirty));
  }

  updateUserPermissions(bool: boolean): void {
    this.userPermissions?.setValue(bool);
    this.userPermissions?.markAsDirty();
  }

  onCustomRoleChange() {
    let selectedRole = this.customRoles.find(role => role.id === this.customRoleId!.value);
    this.userCustomRoleId?.setValue(selectedRole ? selectedRole.id : null);
    this.groupHandler.setSelection(selectedRole ? selectedRole.permissionSet.map(p => p.permissionId) : [])
    this.updateUserPermissions(!!this.groupHandler.selection.length)
  }

  loadTeams(): void {
    this.teamService.loadIfNotExists()
      .pipe(takeUntil(this.destroy$))
      .subscribe((teams) => this.teams = teams);
  }

  loadUserTeams(): void {
    this.teamService
      .loadUserTeamsByUserId(this.model.generalUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((userTeams) => this.userTeamsChanged$.next(userTeams))
  }

  canManage(userSecurity: UserSecurityConfiguration): boolean {
    return this.teamSecurityMap[userSecurity.caseType]?.canManage;
  }

  canAdd(userSecurity: UserSecurityConfiguration): boolean {
    return this.teamSecurityMap[userSecurity.caseType]?.canAdd;
  }

  canView(userSecurity: UserSecurityConfiguration): boolean {
    return this.teamSecurityMap[userSecurity.caseType]?.canView;
  }

  updateUserSecurity(userSecurity: UserSecurityConfiguration): void {
    userSecurity.save()
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_update_success);
      });
  }

  onTabChange($event: TabComponent) {
    this.displaySaveBtn = (!['services', 'teams'].includes($event.name))
  }
}
