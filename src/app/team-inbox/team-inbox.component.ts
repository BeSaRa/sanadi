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
import {DialogRef} from '../shared/models/dialog-ref';
import {OpenFrom} from '../enums/open-from.enum';

@Component({
  selector: 'team-inbox',
  templateUrl: './team-inbox.component.html',
  styleUrls: ['./team-inbox.component.scss']
})
export class TeamInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  inboxChange$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'BD_CASE_TYPE', 'ACTIVATED', 'PI_CREATE', 'PI_DUE', 'fromUserInfo'];
  teams: Team[] = [];
  destroy$: Subject<any> = new Subject<any>();
  selectControl: FormControl = new FormControl();
  actions: IMenuItem[] = [];

  filterControl: FormControl = new FormControl('');

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
    this.inboxChange$.next(this.employee.teams[0].id || null);
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
        if (val.failedOperations && val.failedOperations.length) {
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

  actionSendToUser(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToUser(true).onAfterClose$.subscribe(() => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionSendToDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDepartment(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionComplete(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.complete(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.approve(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionClose(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.close(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionReject(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.reject(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionReturn(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.return(true).onAfterClose$.subscribe(_ => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionOpen(item: QueryResult) {
    item.open(this.actions, OpenFrom.TEAM_INBOX).pipe(switchMap(ref => ref.onAfterClose$)).subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToManager(true).onAfterClose$.subscribe(() => {
      viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  private buildGridActions() {
    this.actions = [
      // claim
      {
        type: 'action',
        icon: 'mdi-hand-right',
        label: 'claim',
        onClick: (item: QueryResult) => this.actionClaim(item)
      },
      // open
      {
        type: 'action',
        icon: 'mdi-eye',
        label: 'open_task',
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => this.actionOpen(item)
      },
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
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      {
        type: 'action',
        icon: 'mdi-star-settings',
        label: 'manage_recommendations',
        data: {
          hideFromViewer: true,
          hideFromContext: true
        },
        onClick: (item: QueryResult) => {
          this.actionManageRecommendations(item);
        }
      },
      // comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        data: {hideFromViewer: true},
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
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_COMPETENT_DEPARTMENT) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToDepartment(item, viewDialogRef);
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_USER) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToUser(item, viewDialogRef);
        }
      },
      // complete
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return !item.RESPONSES.length;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionComplete(item, viewDialogRef);
        }
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.APPROVE) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionApprove(item, viewDialogRef);
        }
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.RETURN) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReturn(item, viewDialogRef);
        }
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.REJECT) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReject(item, viewDialogRef);
        }
      },
      //close
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'close_task',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.CLOSE) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionClose(item, viewDialogRef);
        }
      },
      //to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        data: {
          hideFromContext: true
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_MANAGER) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToManager(item, viewDialogRef);
        }
      }
    ];
  }
}
