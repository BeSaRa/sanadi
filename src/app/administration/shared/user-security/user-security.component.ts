import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {iif, of, Subject} from "rxjs";
import {FormControl} from "@angular/forms";
import {UserTeam} from "@app/models/user-team";
import {UserSecurityConfiguration} from "@app/models/user-security-configuration";
import {TeamSecurityConfiguration} from "@app/models/team-security-configuration";
import {catchError, filter, map, share, switchMap, takeUntil, tap} from "rxjs/operators";
import {UserSecurityConfigurationService} from "@app/services/user-security-configuration.service";
import {InternalUser} from "@app/models/internal-user";
import {OrgUser} from "@app/models/org-user";
import {TeamSecurityConfigurationService} from "@app/services/team-security-configuration.service";
import {ToastService} from "@app/services/toast.service";

@Component({
  selector: 'user-security',
  templateUrl: './user-security.component.html',
  styleUrls: ['./user-security.component.scss']
})
export class UserSecurityComponent implements OnInit, OnDestroy {
  destroy$: Subject<any> = new Subject<any>();
  selectedUserTeam: FormControl = new FormControl();
  private _userTeams: UserTeam[] = [];

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
  model!: InternalUser | OrgUser
  teamSecurityMap!: Record<number, TeamSecurityConfiguration>;
  teamSecurity: TeamSecurityConfiguration[] = [];
  userSecurity: UserSecurityConfiguration[] = [];
  userSecurityColumns: string[] = ['serviceName', 'add', 'search', 'teamInbox'];

  constructor(public lang: LangService,
              private toast: ToastService,
              private teamSecurityService: TeamSecurityConfigurationService,
              private userSecurityService: UserSecurityConfigurationService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToTeamSecurityChange();
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
      })

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
      .subscribe()
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

  toggleUserSecurity(userSecurity: UserSecurityConfiguration, property: 'canView' | 'canManage' | 'canAdd'): void {
    of(userSecurity.clone({[property]: !userSecurity[property]}))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(model => model.save()))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_update_success);
      }, () => {
        userSecurity[property] = !userSecurity[property]
      });
  }

}
