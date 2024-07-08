import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SortableTableDirective } from '../directives/sortable-table.directive';
import { SortEvent } from '@app/interfaces/sort-event';
import { _isNumberValue } from '@angular/cdk/coercion';
import { PaginatorComponent } from '../components/paginator/paginator.component';
import { PageEvent } from '@app/interfaces/page-event';

export class TableDataSource extends DataSource<any> {
  _data: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  _renderData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  filteredData: any[] = [];

  destroy$: Subject<void> = new Subject();

  _filter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  useSearchMethodToFilter: boolean = false;

  searchFieldsName: string = 'searchFields';

  private _paginator?: PaginatorComponent;

  set paginator(val: PaginatorComponent | undefined) {
    this._paginator = val;
    this.updateDataChanges();
  }

  get paginator(): PaginatorComponent | undefined {
    return this._paginator;
  }

  get filter(): string {
    return this._filter.value;
  };

  set filter(value: string) {
    this._filter.next(value);
  }

  _sort: SortableTableDirective | null = null;

  _updatedDataSubscription: Subscription | null = null;

  get sort(): SortableTableDirective | null {
    return this._sort;
  }

  set sort(sort: SortableTableDirective | null) {
    this._sort = sort;
  }

  get data(): any[] {
    return this._data.value;
  }

  set data(val: any[]) {
    if (val !== null) {
      this._data.next(val);
    }
  }


  constructor(_data: any) {
    super();
    this.prepareData(_data);
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    if (!this._updatedDataSubscription) {
      this.updateDataChanges();
    }
    return this._renderData.asObservable();
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private prepareData(data: any) {
    this._data.next(data);
  }


  private updateDataChanges(): void {
    const sortChanges$ = (this._sort ? merge(this._sort.sortChange, this._sort.initialized) : of(null)) as Observable<SortEvent | null>;
    const pageChanges$ = (this._paginator ? this._paginator.pageChange : of(null)) as Observable<PageEvent | null>;

    const filterData$ = combineLatest([this._data, this._filter]).pipe(map(([data]) => this._filterData(data)));

    const orderData$ = combineLatest([filterData$, sortChanges$]).pipe(map(([data]) => this._orderData(data)));
    const pageData$ = combineLatest([orderData$, pageChanges$]).pipe(map(([data]) => this._pageData(data)));

    this._updatedDataSubscription?.unsubscribe();
    this._updatedDataSubscription = pageData$.subscribe((val) => {
      this._renderData.next(val);
    });
  }

  private _orderData(data: any[]): any[] {
    if (!this.sort) {
      return data;
    }
    if (Array.isArray(data))
      return this.sortData(data.slice(), this.sort);
    return data;
  }

  sortingDataAccessor(data: any, sortHeaderId: string): string | number {
    const value = (data as { [key: string]: any })[sortHeaderId];

    if (_isNumberValue(value)) {
      const numberValue = Number(value);

      // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
      // leave them as strings. For more info: https://goo.gl/y5vbSg
      return numberValue < Number.MAX_SAFE_INTEGER ? numberValue : value;
    }

    return value;
  }

  sortData: ((data: any[], sort: SortableTableDirective) => any[]) = (data: any[], sort: SortableTableDirective): any[] => {
    const active = sort.active;
    const direction = sort.direction;
    const activeColumn = this.sort?.getActiveColumn();
    if (!active || direction == '' || sort.backend) {
      return data;
    }

    return data.sort((a, b) => {
      let valueA = this.sortingDataAccessor(a, active);
      let valueB = this.sortingDataAccessor(b, active);

      // If there are data in the column that can be converted to a number,
      // it must be ensured that the rest of the data
      // is of the same type so as not to order incorrectly.
      const valueAType = typeof valueA;
      const valueBType = typeof valueB;

      if (valueAType !== valueBType) {
        if (valueAType === 'number') {
          valueA += '';
        }
        if (valueBType === 'number') {
          valueB += '';
        }
      }

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come last.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;

      if (activeColumn && activeColumn.sortCallback) {
        const paramA = activeColumn.sortParamAsFullItem ? a : valueA;
        const paramB = activeColumn.sortParamAsFullItem ? b : valueB;
        comparatorResult = activeColumn.sortCallback(paramA, paramB, {
          direction: direction,
          active: active
        }) || comparatorResult;
        return comparatorResult * (direction == 'asc' ? 1 : -1);
      }


      if (valueA != null && valueB != null) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction == 'asc' ? 1 : -1);
    });
  };

  private _filterData(data: any[]): any[] {
    this.filteredData = this.filter === null || this.filter === '' ? data : data.filter(item => this.filterPredicate(item, this.filter));
    if (this.paginator && !this._paginator?.backend) {
      this.paginator.length = this.filteredData.length;
    }
    return this.filteredData;
  }

  /**
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has
   * at least one occurrence in that string. By default, the filter string has its whitespace
   * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
   * filter matching.
   * @param data Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   * @returns Whether the filter matches against the data
   */
  filterPredicate: ((data: any, filter: string) => boolean) = (data: any, filter: string): boolean => {
    // Transform the data into a lowercase string of all property values.
    if (typeof data.search === 'function' && data[this.searchFieldsName] && this.useSearchMethodToFilter) {
      return data.search(filter, this.searchFieldsName);
    }

    const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
      // Use an obscure Unicode character to delimit the words in the concatenated string.
      // This avoids matches where the values of two columns combined will match the user's query
      // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
      // that has a very low chance of being typed in by somebody in a text field. This one in
      // particular is "White up-pointing triangle with dot" from
      // https://en.wikipedia.org/wiki/List_of_Unicode_characters
      return currentTerm + (data as { [key: string]: any })[key] + '◬';
    }, '').toLowerCase();

    // Transform the filter by converting it to lowercase and removing whitespace.
    const transformedFilter = filter.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) != -1;
  };

  private _pageData(data: any[]): any[] {
    if (!this._paginator || (this._paginator && this._paginator.backend)) {
      return data;
    }
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    return data.slice().slice(startIndex, (startIndex + this._paginator.pageSize));
  }
}
