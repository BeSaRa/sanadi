import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {SubventionLog} from '../../../models/subvention-log';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {searchInObject} from '../../../helpers/utils';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-subvention-log-popup',
  templateUrl: './subvention-log-popup.component.html',
  styleUrls: ['./subvention-log-popup.component.scss']
})
export class SubventionLogPopupComponent implements OnInit, OnDestroy {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['organization', 'branch', 'user', 'actionType', 'actionTime', 'comments'];
  logListClone: SubventionLog[] = this.logList;
  search$: Subject<string> = new Subject<string>();
  searchSubscription!: Subscription;

  constructor(@Inject(DIALOG_DATA_TOKEN) public logList: SubventionLog[],
              public langService: LangService) {
  }

  ngOnInit(): void {
    this.listenToSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  search(searchText: string): void {
    this.search$.next(searchText);
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

}
