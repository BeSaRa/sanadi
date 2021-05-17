import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, combineLatest, isObservable, Observable, of, Subject, Subscription} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {SortableTableDirective} from '../directives/sortable-table.directive';
import {SortEvent} from '../../interfaces/sort-event';
import {_isNumberValue} from '@angular/cdk/coercion';

export class TableDataSource extends DataSource<any> {
  _data: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  _renderData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  filteredData: any[] = [];

  destroy$: Subject<any> = new Subject<any>();

  _filter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get filter(): string {
    return this._filter.value;
  };

  set filter(value: string) {
    this._filter.next(value);
    this.updateDataChanges();
  }

  _sort: SortableTableDirective | null = null;

  _updatedDataSubscription: Subscription | null = null;

  get sort(): SortableTableDirective | null {
    return this._sort;
  }

  set sort(sort: SortableTableDirective | null) {
    this._sort = sort;
    this.updateDataChanges();
  }

  get data(): any[] {
    return this._data.value;
  }

  set data(val: any[]) {
    this._data.next(val);
  }


  constructor(_data: any) {
    super();
    this.prepareData(_data);
    this.updateDataChanges();
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this._renderData.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private prepareData(data: any) {
    if (isObservable(data)) {
      data.pipe(
        takeUntil(this.destroy$),
        tap((val: any) => this._data.next(val))
      ).subscribe();
    } else {
      this._data.next(data);
    }
  }


  private updateDataChanges(): void {
    const sortChange$ = this.sort ? this._sort?.sortChange as Observable<SortEvent | null> : of(null);

    const filterData$ = combineLatest([this._data, this._filter])
      .pipe(
        map(([data]) => this._filterData(data)),
        tap(val => console.log('FILTERD', val))
      );

    this._updatedDataSubscription = combineLatest([filterData$, sortChange$])
      .pipe(
        map(([data]) => this._orderData(data))
      )
      .subscribe((data) => {
        this._renderData.next(data);
      });
  }

  private _orderData(data: any[]): any[] {
    if (!this.sort) {
      return data;
    }
    return this.sortData(data.slice(), this.sort);
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

  sortData(data: any[], sort: SortableTableDirective): any[] {
    const active = sort.active;
    const direction = sort.direction;

    if (!active || direction == '' || sort.sortBack) {
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
    if (this.filter === null || this.filter === '') {
      return data;
    }
    return data.filter(item => this.filterPredicate(item, this.filter));
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
  filterPredicate(data: any, filter: string): boolean {
    // Transform the data into a lowercase string of all property values.
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
  }
}
