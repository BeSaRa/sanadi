import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {SortEvent} from '../../../interfaces/sort-event';
import {PageEvent} from '../../../interfaces/page-event';
import {UserInboxService} from '../../../services/user-inbox.service';
import {QueryResultSet} from '../../../models/query-result-set';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-user-inbox',
  templateUrl: './user-inbox.component.html',
  styleUrls: ['./user-inbox.component.scss']
})
export class UserInboxComponent implements OnInit {
  queryResultSet?: QueryResultSet;
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'name', 'weight', 'actions'];
  searchModel = '';

  constructor(public lang: LangService, private inboxService: UserInboxService) {
    this.inboxService.load();
  }

  reload(): void {
    this.inboxService.load().pipe(tap(result => console.log(result.items))).subscribe(result => this.queryResultSet = result);
  }

  ngOnInit(): void {
    this.reload();
  }

  sortBy($event: SortEvent) {
    console.log($event);
  }

  search($event: Event) {
    let input = $event.target as HTMLInputElement;
    this.searchModel = input.value;
  }

  log($event: PageEvent) {
    console.log($event);
  }
}
