import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {TableDataSource} from '../shared/models/table-data-source';

@Injectable({
  providedIn: 'root'
})
export class TableService implements OnDestroy {
  private _dataSource?: TableDataSource;
  private _dataSourceChange: Subject<TableDataSource> = new Subject<TableDataSource>();
  private destroy$: Subject<void> = new Subject();
  dataSourceChanges$: Observable<TableDataSource> = this._dataSourceChange.asObservable();

  constructor() {
    this.listenToDataSourceChanges();
  }

  createDataSource(value: any): TableDataSource {
    return new TableDataSource(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToDataSourceChanges() {
    this.dataSourceChanges$
      .subscribe((dataSource) => {
        this._dataSource = dataSource;
      });
  }
}
