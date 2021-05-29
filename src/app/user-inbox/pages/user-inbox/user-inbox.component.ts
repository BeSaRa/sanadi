import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {InboxService} from '../../../services/inbox.service';
import {QueryResultSet} from '../../../models/query-result-set';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {EServiceListService} from '../../../services/e-service-list.service';
import {QueryResult} from '../../../models/query-result';
import {BehaviorSubject, Subject} from 'rxjs';
import {WFResponseType} from '../../../enums/wfresponse-type.enum';
import {IMenuItem} from '../../../modules/context-menu/interfaces/i-menu-item';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-user-inbox',
  templateUrl: './user-inbox.component.html',
  styleUrls: ['./user-inbox.component.scss']
})
export class UserInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'BD_CASE_TYPE', 'PI_CREATE', 'PI_DUE', 'actions'];
  searchModel = '';
  reloadInbox$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private destroy$: Subject<any> = new Subject<any>();
  actions: IMenuItem[] = [];

  constructor(public lang: LangService,
              private toast: ToastService,
              public eService: EServiceListService,
              private inboxService: InboxService) {

  }


  private listenToReload() {
    this.reloadInbox$
      .pipe(
        switchMap(_ => this.inboxService.loadUserInbox()),
        takeUntil(this.destroy$),
        tap(items => console.log(items))
      )
      .subscribe((value) => {
        this.queryResultSet = value;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.listenToReload();
    this.buildGridActions();
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionSendToUser(item: QueryResult): void {
    item.sendToUser().onAfterClose$.subscribe(_ => this.reloadInbox$.next(null));
  }

  actionSendToDepartment(item: QueryResult): void {
    item.sendToDepartment().onAfterClose$.subscribe(_ => this.reloadInbox$.next(null));
  }

  actionComplete(item: QueryResult): void {
    item.complete().subscribe(_ => {
      this.toast.success(this.lang.map.task_complete_successfully);
      this.reloadInbox$.next(null);
    });
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
      // send to department
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
        icon: 'mdi-check-circle',
        label: 'task_complete',
        show: (item: QueryResult) => {
          return !item.RESPONSES.length;
        },
        onClick: (item: QueryResult) => {
          this.actionComplete(item);
        }
      }
    ];
  }
}
