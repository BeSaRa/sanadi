import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {TeamService} from '@services/team.service';
import {UserTeamService} from '@services/user-team.service';
import {TeamSecurityConfigurationService} from '@services/team-security-configuration.service';
import {ConfigurationService} from '@services/configuration.service';
import {UserSecurityConfigurationService} from '@services/user-security-configuration.service';
import {BehaviorSubject, iif, of, Subject} from 'rxjs';
import {UserSecurityConfiguration} from '@app/models/user-security-configuration';
import {catchError, filter, map, share, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Team} from '@app/models/team';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {InternalUser} from '@app/models/internal-user';
import {ExternalUser} from '@app/models/external-user';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {AdminResult} from '@app/models/admin-result';
import {TeamSecurityConfiguration} from '@app/models/team-security-configuration';

@Component({
  selector: 'user-security-external',
  templateUrl: './user-security-external.component.html',
  styleUrls: ['./user-security-external.component.scss']
})
export class UserSecurityExternalComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();
  private oldExternalUserSecurity$: BehaviorSubject<UserSecurityConfiguration[]> = new BehaviorSubject<UserSecurityConfiguration[]>([]);
  userSecurityColumns: string[] = ['serviceName', 'add', 'search', 'teamInbox', 'approval', 'followUp'];
  private teams: Team[] = [];
  externalUserTeamId!: number;
  teamSecurityMap!: Record<number, TeamSecurityConfiguration>;
  teamSecurity: TeamSecurityConfiguration[] = [];
  userSecurity: UserSecurityConfiguration[] = [];
  isOldValueListed: boolean = false;

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
    this.loadTeamsAndSecurity();
  }

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

  @Input()
  model!: ExternalUser;

  private _profileId?: number;
  @Input()
  set profileId(value: number | undefined) {
    this._profileId = value;
    this.handleChangeProfile();
  }

  get profileId(): number | undefined {
    return this._profileId;
  }

  @Input() userUpdateRequest?: ExternalUserUpdateRequest;

  private loadTeamsAndSecurity(): void {
    this.teamService
      .loadAsLookups()
      .pipe(tap(teams => this.teams = teams))
      .pipe(map(teams => teams.filter(team => this.configService.CONFIG.CHARITY_ORG_TEAM === team.authName)[0]))
      .pipe(tap(team => this.externalUserTeamId = team.id))
      .subscribe((team) => {
        this.handleChangeProfile();
      });
  }

  toggleUserSecurity(userSecurity: UserSecurityConfiguration, property: 'canView' | 'canManage' | 'canAdd' | 'approval' | 'followUp'): void {
    userSecurity[property] = !userSecurity[property];
    // console.log('old', this.getOldUserSecurity());
    // console.log('new', this.getFinalUserSecurity());
  }

  getOldUserSecurity(): UserSecurityConfiguration[] {
    return this.oldExternalUserSecurity$.value;
  }

  getFinalUserSecurity(): UserSecurityConfiguration[] {
    return this.userSecurity;
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

  private handleChangeProfile() {
    if (!this.profileId || !this.externalUserTeamId) {
      this.userSecurity = [];
      return;
    }
    const insertDefaultTeamSecurity$ = (userSecurity: UserSecurityConfiguration[]) => {
      let securityConfigurations: UserSecurityConfiguration[];
      let caseTypeIds = userSecurity.map(item => item.caseType);
      securityConfigurations = this.teamSecurity
        .filter(team => !caseTypeIds.includes(team.caseType))
        .map(ts => new UserSecurityConfiguration().clone(ts.convertToUserSecurity(this.model.generalUserId)));

      const security = caseTypeIds ? userSecurity.concat(securityConfigurations) : securityConfigurations;
      return of(security);

    };

    of(this.externalUserTeamId)
      .pipe(
        // get the team security configuration
        switchMap(teamId => {
          return this.teamSecurityService.loadSecurityByTeamIdAndProfileId(teamId, this.profileId!);
        }),
        tap((teamSecurity) => this.teamSecurity = teamSecurity),
        // create team security map based on caseType to use it later in grid
        tap(_ => {
          this.teamSecurityMap = this.teamSecurity.reduce((acc, item) => {
            return {...acc, [item.caseType]: item};
          }, {}) || {};
        }),
        // get the user security configuration
        switchMap(() => {
          // there will be no user security when creating external user
          if (!this.model.generalUserId) {
            return of([]);
          }
          return this.userSecurityService.loadSecurityByTeamId(this.externalUserTeamId, this.model.generalUserId);
        }),
        // if there is length for the user security configurations we have to display the right mapping on the view
        switchMap((userSecurity => iif(() => !userSecurity.length || (userSecurity.length !== this.teamSecurity.length), insertDefaultTeamSecurity$(userSecurity), of(userSecurity)))),
        tap((userSecurity) => {
          if (!this.isOldValueListed) {
            this.oldExternalUserSecurity$.next(userSecurity.map(data => new UserSecurityConfiguration().clone(data)));
            this.isOldValueListed = true;
          }
          if (!!this.userUpdateRequest && Object.keys(this.teamSecurityMap).length) {
            this.userSecurity = this.userUpdateRequest.newServicePermissions.map(item => new UserSecurityConfiguration().clone({
                ...item,
                serviceInfo: this.teamSecurityMap[item.caseType]?.serviceInfo ?? new AdminResult()
              })
            );
            return;
          }
          this.userSecurity = userSecurity;
        })
      )
      .subscribe();
  }
}
