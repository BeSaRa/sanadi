import {Component, OnDestroy, OnInit} from '@angular/core';
import {QueryResultSet} from '../models/query-result-set';
import {LangService} from '../services/lang.service';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {Team} from '../models/team';
import {EmployeeService} from '../services/employee.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {EServiceListService} from '../services/e-service-list.service';
import {QueryResult} from '../models/query-result';
import {InboxService} from '../services/inbox.service';
import {ToastService} from '../services/toast.service';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {WFResponseType} from '../enums/wfresponse-type.enum';

@Component({
  selector: 'team-inbox',
  templateUrl: './team-inbox.component.html',
  styleUrls: ['./team-inbox.component.scss']
})
export class TeamInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  inboxChange$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  displayedColumns: string[] = ['select', 'BD_FULL_SERIAL', 'BD_CASE_TYPE', 'PI_CREATE', 'PI_DUE', 'actions'];
  searchModel = '';
  teams: Team[] = [];
  destroy$: Subject<any> = new Subject<any>();
  selectControl: FormControl = new FormControl();
  actions: IMenuItem[] = [];

  constructor(public lang: LangService,
              private toast: ToastService,
              private inboxService: InboxService,
              public eService: EServiceListService,
              public employee: EmployeeService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasSelectedInbox(): boolean {
    return !!this.inboxChange$.value;
  }

  loadSelectedTeamInbox(): Observable<null | QueryResultSet> {
    if (!this.hasSelectedInbox()) {
      return of(null);
    }
    return this.inboxService.loadTeamInbox(this.inboxChange$.value!)
      .pipe(tap(val => console.log(val.items)))
      .pipe(tap(result => this.queryResultSet = result));
  }

  ngOnInit(): void {
    this.reloadDefaultTeam();
    this.selectControl.patchValue(this.inboxChange$.value);
    this.listenToInboxChange();
    this.listenToSelectControl();
    this.buildGridActions();
  }

  reloadDefaultTeam(): void {
    this.inboxChange$.next(this.employee.getInternalDepartment()?.mainTeam.id || this.employee.teams[0].id || null);
  }

  private listenToInboxChange() {
    this.inboxChange$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.loadSelectedTeamInbox();
        })
      ).subscribe();
  }

  private listenToSelectControl() {
    this.selectControl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.inboxChange$.next(value);
      });
  }

  reloadSelectedInbox() {
    this.inboxChange$.next(this.inboxChange$.value);
  }

  actionClaim(item: QueryResult) {
    item.claim()
      .pipe(take(1))
      .subscribe((val) => {
        this.reloadSelectedInbox();
        if (val.failedOperations) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.task_have_been_claimed_successfully);
      });
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToUser(item: QueryResult): void {
    item.sendToUser().onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionSendToDepartment(item: QueryResult): void {
    item.sendToDepartment().onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionComplete(item: QueryResult): void {
    item.complete().subscribe((val) => {
      console.log(val);
      this.reloadSelectedInbox();
    });
  }

  private buildGridActions() {
    this.actions = [
      // view logs
      {
        icon: 'mdi-view-list-outline',
        label: 'logs',
        onClick: (item: QueryResult) => this.actionViewLogs(item)
      },
      // claim
      {
        icon: 'mdi-hand-right',
        label: 'claim',
        onClick: (item: QueryResult) => {
          this.actionClaim(item);
        }
      },
      // manage attachments
      {
        icon: 'mdi-paperclip',
        label: 'manage_attachments',
        onClick: (item: QueryResult) => {
          this.actionManageAttachments(item);
        }
      },
      // send to department
      {
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_COMPETENT_DEPARTMENT) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionSendToDepartment(item);
        }
      },
      // send to user
      {
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_USER) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionSendToUser(item);
        }
      },
      // complete
      {
        icon: 'mdi-check-circle',
        label: 'send_to_user',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_USER) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionComplete(item);
        }
      }
    ];
  }
}
