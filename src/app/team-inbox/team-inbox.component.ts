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
  displayedColumns: string[] = ['select', 'BD_FULL_SERIAL', 'BD_CASE_TYPE', 'PI_CREATE', 'PI_DUE'];
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

  actionManageRecommendations(item: QueryResult) {
    item.manageRecommendations().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionManageComments(item: QueryResult) {
    item.manageComments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToUser(item: QueryResult): void {
    item.sendToUser(true).onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToDepartment(item: QueryResult): void {
    item.sendToDepartment(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionComplete(item: QueryResult): void {
    item.complete(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionApprove(item: QueryResult): void {
    item.approve(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionClose(item: QueryResult): void {
    item.close(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionReject(item: QueryResult): void {
    item.reject(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  actionReturn(item: QueryResult): void {
    item.return(true).onAfterClose$.subscribe(_ => this.reloadSelectedInbox());
  }

  private buildGridActions() {
    this.actions = [
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        onClick: (item: QueryResult) => this.actionViewLogs(item)
      },
      // manage attachments
      {
        type: 'action',
        icon: 'mdi-paperclip',
        label: 'manage_attachments',
        onClick: (item: QueryResult) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      {
        type: 'action',
        icon: 'mdi-star-settings',
        label: 'manage_recommendations',
        onClick: (item: QueryResult) => {
          this.actionManageRecommendations(item);
        }
      },
      // comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        onClick: (item: QueryResult) => {
          this.actionManageComments(item);
        }
      },
      // send to department
      {type: 'divider'},
      {
        type: 'action',
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
        type: 'action',
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
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        show: (item: QueryResult) => {
          return !item.RESPONSES.length;
        },
        onClick: (item: QueryResult) => {
          this.actionComplete(item);
        }
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.APPROVE) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionApprove(item);
        }
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.RETURN) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionReturn(item);
        }
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.REJECT) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionReject(item);
        }
      },
      //close
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'close_task',
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.CLOSE) !== -1;
        },
        onClick: (item: QueryResult) => {
          this.actionClose(item);
        }
      }
    ];
  }
}
