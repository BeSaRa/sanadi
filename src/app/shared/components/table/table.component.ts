import {Component, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {TableService} from '../../../services/table.service';
import {BehaviorSubject, isObservable, Observable, Subject, Subscription} from 'rxjs';
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
  private datasourceAssigned$: BehaviorSubject<TableDataSource> = new BehaviorSubject<TableDataSource>(this.service.createDataSource([]));
  dataSource!: TableDataSource;
  private destroy$: Subject<any> = new Subject();
  @Input()
  columns: string[] = [];

  _filter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  _paginator?: PaginatorComponent;
  private dataChange: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  @Input()
  set filter(val: string) {
    this._filter.next(val);
  };

  get filter(): string {
    return this._filter.value;
  }

  @Input()
  set data(value: any) {
    this.dataChange.next(value);
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

  constructor(private service: TableService,
              @Optional() private sortable: SortableTableDirective) {
  }

  ngOnInit(): void {
    this.datasourceAssigned();
    this.listenToFilterChange();
    this.listenToDataChanged();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  datasourceAssigned(): void {
    this.datasourceAssigned$
      .pipe(takeUntil(this.destroy$))
      .subscribe((datasource) => {
        if (this.dataSource) {
          this.dataSource.disconnect();
        }
        this.dataSource = datasource;
        this.dataSource.filter = this.filter;
        this.dataSource.sort = this.sortable;
        this.dataSource.paginator = this.paginator;
      });
  }

  private listenToFilterChange() {
    this._filter.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.dataSource.filter = value;
      });
  }

  private listenToDataChanged() {
    let oldSub: Subscription;
    this.dataChange.pipe(takeUntil(this.destroy$))
      .subscribe((value: Observable<any> | any[]) => {
        if (isObservable(value)) {
          oldSub?.unsubscribe();
          oldSub = value.pipe(takeUntil(this.destroy$)).subscribe((data: any[]) => this.dataSource.data = data);
        } else {
          this.dataSource.data = value;
        }
      });
  }
}
