import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {SubventionLog} from '../../../models/subvention-log';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {printBlobData, searchInObject} from '../../../helpers/utils';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SubventionLogService} from '../../../services/subvention-log.service';
import {IDialogData} from '../../../interfaces/i-dialog-data';

@Component({
  selector: 'app-subvention-log-popup',
  templateUrl: './subvention-log-popup.component.html',
  styleUrls: ['./subvention-log-popup.component.scss']
})
export class SubventionLogPopupComponent implements OnInit, OnDestroy {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['organization', 'branch', 'user', 'actionType', 'actionTime', 'comments'];
  search$: Subject<string> = new Subject<string>();
  internalSearch$: Subject<string> = new Subject<string>();
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;
  logList: SubventionLog[];
  logListClone: SubventionLog[] = [];
  requestId: number;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<SubventionLog[]>,
              public langService: LangService,
              private subventionLogService: SubventionLogService) {
    this.logList = data.logList;
    this.logListClone = data.logList;
    this.requestId = data.requestId;
  }

  ngOnInit(): void {
    this.listenToSearch();
    this.listenToInternalSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  printLogs($event: MouseEvent): void {
    this.subventionLogService.loadByRequestIdAsBlob(this.requestId)
      .subscribe((data) => {
        printBlobData(data, 'RequestLogs.pdf');
      });
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.logList = this.logListClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.logList = this.logListClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

}
