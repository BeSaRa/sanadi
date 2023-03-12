import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { TableService } from '@app/services/table.service';
import { BehaviorSubject, isObservable, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableDataSource } from '../../models/table-data-source';
import { PaginatorComponent } from '../paginator/paginator.component';
import { SortableTableDirective } from '../../directives/sortable-table.directive';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [TableService]
})
export class TableComponent implements OnInit, OnDestroy {
  private datasourceAssigned$: BehaviorSubject<TableDataSource> = new BehaviorSubject<TableDataSource>(this.service.createDataSource([]));
  private destroy$: Subject<any> = new Subject();
  private dataChange: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  dataSource!: TableDataSource;
  @Input()
  columns: string[] = [];
  @Input()
  selectable: boolean = false;
  @Input()
  multiSelect: boolean = true;

  selection!: SelectionModel<any>;

  _filter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  _paginator?: PaginatorComponent;

  _filterCallback?: ((data: any, filter: string) => boolean);

  @Input()
  set filterCallback(callback: ((data: any, filter: string) => boolean)) {
    this._filterCallback = callback;
  };

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
  useSearchToFilter: boolean = false;

  @Input()
  searchFieldsName: string = 'searchFields';

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
    this.generateSelectionModel();
    this.datasourceAssigned();
    this.listenToFilterChange();
    this.listenToDataChanged();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAll(): void {
    const allSelected = this.allSelected();
    if (allSelected) {
      this.clearSelection();
    } else {
      this.dataSource.data.forEach(item => this.selection.select(item));
    }
  }

  allSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  private datasourceAssigned(): void {
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
        this.dataSource.useSearchMethodToFilter = this.useSearchToFilter;
        this.dataSource.searchFieldsName = this.searchFieldsName;
        if (this._filterCallback) {
          this.dataSource.filterPredicate = this._filterCallback;
        }
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
      .subscribe((value: Observable<any[]> | any[]) => {
        if (isObservable(value)) {
          oldSub?.unsubscribe();
          oldSub = value.pipe(takeUntil(this.destroy$)).subscribe((data: any[]) => this.dataSource.data = data);
        } else {
          this.dataSource.data = value;
        }
      });
  }

  private generateSelectionModel() {
    if (this.selectable) {
      this.selection = new SelectionModel<any>(this.multiSelect);
    }
  }

  clearSelection(): void {
    this.selection && this.selection.clear();
  }

  hasSelectedRecords(): boolean {
    return !this.selection ? false : this.selection.selected.length > 0;
  }

  /**
   * @description Gets the actual index of item in table
   * It will not consider the sorting/searching on table
   * @param clickedIndex
   */
  getActualItemIndex(clickedIndex: number): number | undefined {
    let paginator = this.dataSource.paginator;
    if (paginator) {
      return paginator.pageSize * (paginator.currentPage - 1) + (clickedIndex);
    }
    return undefined;

    //(currentPage * perPage) - (perPage -index)
  }
}
