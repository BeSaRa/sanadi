import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {InboxService} from '../../../services/inbox.service';
import {QueryResultSet} from '../../../models/query-result-set';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {EServiceListService} from '../../../services/e-service-list.service';
import {QueryResult} from '../../../models/query-result';
import {BehaviorSubject, Subject} from 'rxjs';

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

  constructor(public lang: LangService,
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
  }

  openAttachmentsDialog(item: QueryResult) {
    item.manageAttachments()
      .onAfterClose$
      .subscribe(() => this.reloadInbox$.next(null));
  }

  showLogs(item: QueryResult) {
    item.showLogs()
      .onAfterClose$
      .subscribe(() => this.reloadInbox$.next(null));
  }
}
