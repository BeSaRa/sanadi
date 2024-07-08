import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, iif, of, Subject} from 'rxjs';
import {UntypedFormControl} from '@angular/forms';
import {UserTeam} from '@app/models/user-team';
import {UserSecurityConfiguration} from '@app/models/user-security-configuration';
import {TeamSecurityConfiguration} from '@app/models/team-security-configuration';
import {catchError, distinctUntilChanged, filter, map, share, switchMap, takeUntil, tap} from 'rxjs/operators';
import {UserSecurityConfigurationService} from '@app/services/user-security-configuration.service';
import {InternalUser} from '@app/models/internal-user';
import {ExternalUser} from '@app/models/external-user';
import {TeamSecurityConfigurationService} from '@app/services/team-security-configuration.service';
import {ToastService} from '@app/services/toast.service';
import {TeamService} from '@app/services/team.service';
import {Team} from '@app/models/team';
import {ConfigurationService} from '@app/services/configuration.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UserTeamService} from '@app/services/user-team.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Component({
  selector: 'user-security',
  templateUrl: './user-security.component.html',
  styleUrls: ['./user-security.component.scss']
})
export class UserSecurityComponent implements OnInit, OnDestroy {
  destroy$: Subject<void> = new Subject();
  selectedUserTeam: UntypedFormControl = new UntypedFormControl();
  commonStatusEnum = CommonStatusEnum;
  private _userTeams: UserTeam[] = [];
  private _operation: BehaviorSubject<OperationTypes> = new BehaviorSubject<OperationTypes>(OperationTypes.CREATE);
  @Input()
  readonly: boolean = false;

  @Input()
  set operation(value: OperationTypes) {
    this._operation.next(value);
  };

  get operation(): OperationTypes {
    return this._operation.value;
  }

  get isSelectedUserTeamActive(): boolean {
    if (this.model.isExternal()) { // always return true if the current user external
      return true;
    }
    if (!this.selectedUserTeam || !this.selectedUserTeam.value) {
      return false;
    }
    let team = this.userTeams.find(x => Number(x.teamId) === Number(this.selectedUserTeam.value));
    return !team ? false : team.isActive();
  }

  @Input()
  set userTeams(value: UserTeam[]) {
    this._userTeams = value;
    this.selectedUserTeam.patchValue(null);
    this.userSecurity = [];
  }

  get userTeams(): UserTeam[] {
    return this._userTeams;
  }

  @Input()
  model!: InternalUser | ExternalUser;
  teamSecurityMap!: Record<number, TeamSecurityConfiguration>;
  teamSecurity: TeamSecurityConfiguration[] = [];
  userSecurity: UserSecurityConfiguration[] = [];
  userSecurityColumns: string[] = ['serviceName', 'add', 'search', 'teamInbox'];
  private teams: Team[] = [];


  constructor(public lang: LangService,
              private toast: ToastService,
              private teamService: TeamService,
              private userTeamService: UserTeamService,
              private teamSecurityService: TeamSecurityConfigurationService,
              private configService: ConfigurationService,
              private userSecurityService: UserSecurityConfigurationService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToTeamSecurityChange();
    if (this.model.isExternal()) {
      this.userSecurityColumns = this.userSecurityColumns.concat(['approval', 'followUp']);
    }
    this.listenToOperationChange();
  }

  private loadTeamsAndSecurity(): void {
    this.teamService
      .loadAsLookups()
      .pipe(tap(teams => this.teams = teams))
      .pipe(map(teams => teams.filter(team => this.configService.CONFIG.CHARITY_ORG_TEAM === team.authName)[0]))
      .subscribe((team) => {
        this.selectedUserTeam.setValue(team.id);
      });
  }

  private listenToTeamSecurityChange() {
    const selectedTeam$ = this.selectedUserTeam
      .valueChanges
      .pipe(share());

    const clear$ = selectedTeam$.pipe(takeUntil(this.destroy$), filter(value => !value));
    const selected$ = selectedTeam$.pipe(takeUntil(this.destroy$), filter(value => !!value));

    clear$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.userSecurity = [];
      });

    const insertDefaultTeamSecurity$ = (userSecurity: UserSecurityConfiguration[]) => {
      let securityConfigurations: UserSecurityConfiguration[];
      let caseTypeIds = userSecurity.map(item => item.caseType);
      securityConfigurations = this.teamSecurity
        .filter(team => !caseTypeIds.includes(team.caseType))
        .map(t => t.convertToUserSecurity(this.model.generalUserId)) as UserSecurityConfiguration[];

      return this.userSecurityService.createBulk(securityConfigurations).pipe(catchError(_ => of([] as UserSecurityConfiguration[])))
        .pipe(map(result => result.map((item, index) => {
          item.teamInfo = this.teamSecurity[index].teamInfo;
          item.serviceInfo = this.teamSecurity[index].serviceInfo;
          return item;
        })))
        .pipe(map(list => caseTypeIds ? userSecurity.concat(list) : list));
    };

    selected$
      .pipe(
        // get the team security configuration
        switchMap(teamId => {
          if (this.model.isExternal()) {
            return this.teamSecurityService.loadSecurityByTeamIdAndProfileId(teamId, (this.model as ExternalUser).getProfileId());
          }
          return this.teamSecurityService.loadSecurityByTeamId(teamId);
        }),
        tap((teamSecurity) => this.teamSecurity = teamSecurity),
        // create team security map based on caseType to use it later in grid
        tap(_ => {
          this.teamSecurityMap = this.teamSecurity.reduce((acc, item) => {
            return {...acc, [item.caseType]: item};
          }, {}) || {};
        }),
        // get the user security configuration
        switchMap(() => this.userSecurityService.loadSecurityByTeamId(this.selectedUserTeam.value, this.model.generalUserId)),
        // if there is length for the user security configurations we have to display the right mapping on the view
        switchMap((userSecurity => iif(() => !userSecurity.length || (userSecurity.length !== this.teamSecurity.length), insertDefaultTeamSecurity$(userSecurity), of(userSecurity)))),
        tap((userSecurity) => this.userSecurity = userSecurity)
      )
      .subscribe();
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

  updateBulkUserSecurity(userSecurity: UserSecurityConfiguration, property: 'canView' | 'canManage' | 'canAdd' | 'approval' | 'followUp'): void {
    userSecurity[property] = !userSecurity[property];
    const list = this.userSecurity.map<Partial<UserSecurityConfiguration>>(item => ({
      id: item.id,
      canView: item.canView,
      canAdd: item.canAdd,
      canManage: item.canManage,
      generalUserId: item.generalUserId,
      teamId: item.teamId,
      caseType: item.caseType,
      serviceId: item.serviceId,
      approval: item.approval,
      followUp: item.followUp,
    }));
    // // for testing purpose
    // // this.userSecurityService.deleteBulkExternal(list).subscribe();
    //
    this.userSecurityService.updateBulkExternal(list)
      .subscribe((updated) => {
        this.toast.success(this.lang.map.msg_update_success);
        this.userSecurity = this.userSecurity.map(((item, index) => {
          item.id = updated[index].id;
          return item;
        }));
      });
  }

  toggleUserSecurity(userSecurity: UserSecurityConfiguration, property: 'canView' | 'canManage' | 'canAdd' | 'approval' | 'followUp'): void {
    if (!this.isSelectedUserTeamActive) {
      return;
    }
    if (this.model.isExternal()) {
      return this.updateBulkUserSecurity(userSecurity, property);
    }
    userSecurity.clone({[property]: !userSecurity[property]})
      .save()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updated) => {
        this.userSecurity = this.userSecurity.map((item => {
          item.id === userSecurity.id && (item[property] = updated[property]);
          return item;
        }));
        this.toast.success(this.lang.map.msg_update_success);
      }, () => {
        userSecurity[property] = !userSecurity[property];
      });
  }

  private listenToOperationChange() {
    this._operation
      .pipe(takeUntil(this.destroy$))
      .pipe(distinctUntilChanged())
      .pipe(filter(val => val !== OperationTypes.CREATE && this.model.isExternal()))
      .subscribe(() => {
        this.loadTeamsAndSecurity();
      });
  }
}
