import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TableService} from '../../../services/table.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TableDataSource} from '../../models/table-data-source';

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

  constructor(private service: TableService) {
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
        this.dataSource = datasource;
      });
  }

  private listenToFilterChange() {
    this._filter.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.dataSource.filter = value;
      });
  }
}
