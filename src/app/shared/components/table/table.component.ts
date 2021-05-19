import {Component, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {TableService} from '../../../services/table.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TableDataSource} from '../../models/table-data-source';
import {PaginatorComponent} from '../paginator/paginator.component';
import {SortableTableDirective} from '../../directives/sortable-table.directive';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [TableService]
})
export class TableComponent implements OnInit, OnDestroy {
  private dataSourceChanged: BehaviorSubject<TableDataSource> = new BehaviorSubject<TableDataSource>(this.service.createDataSource([]));
  dataSource!: TableDataSource;
  private destroy$: Subject<any> = new Subject();
  @Input()
  columns: string[] = [];

  _filter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  _paginator?: PaginatorComponent;

  @Input()
  set filter(val: string) {
    this._filter.next(val);
  };

  get filter(): string {
    return this._filter.value;
  }

  @Input()
  set data(value: any) {
    this.dataSourceChanged.next(this.service.createDataSource(value));
  };

  @Input()
  set paginator(val: PaginatorComponent | undefined) {
    this._paginator = val;
    if (val && this.dataSource) {
      this.dataSource.paginator = this._paginator;
    }
  }

  get paginator(): PaginatorComponent | undefined {
    return this._paginator;
  }

  constructor(private service: TableService, @Optional() private sortable: SortableTableDirective) {
  }

  ngOnInit(): void {
    this.listenToDataSourceChange();
    this.listenToFilterChange();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  listenToDataSourceChange(): void {
    this.dataSourceChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((datasource) => {
        if (this.dataSource) {
          this.dataSource.disconnect();
        }
        this.dataSource = datasource;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filter = this.filter;
        this.dataSource.sort = this.sortable;
      });
  }

  private listenToFilterChange() {
    this._filter.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.dataSource.filter = value;
      });
  }
}
