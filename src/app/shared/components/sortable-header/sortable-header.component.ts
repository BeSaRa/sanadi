import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SortableTableDirective} from '../../directives/sortable-table.directive';
import {CdkColumnDef} from '@angular/cdk/table';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SortEvent} from '@app/interfaces/sort-event';

@Component({
  selector: '[sortable-header]',
  templateUrl: './sortable-header.component.html',
  styleUrls: ['./sortable-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortableHeaderComponent implements OnInit, OnDestroy {
  @Input('sortStart')
  start?: string = 'asc';
  id!: string;
  _arrowDirection: string = '';
  @Input()
  sortCallback?: (a: any, b: any, sort: SortEvent) => number;
  @Input()
  sortParamAsFullItem: boolean = false;

  arrowDirections: { [index: string]: string } = {
    asc: 'mdi-arrow-up',
    desc: 'mdi-arrow-down'
  };
  private destroy$: Subject<void> = new Subject();

  constructor(
    private cd: ChangeDetectorRef,
    private _sort: SortableTableDirective,
    private _colDef: CdkColumnDef) {
  }

  ngOnInit(): void {
    if (!this._sort) {
      throw Error('PLEASE PROVIDE Sortable Table directive to the table');
    }
    this.id = this._colDef.name;

    this._sort.registerColumn(this);
    this.handleSortChange();
  }

  sort() {
    this._sort.sort(this);
  }

  isSorted(): boolean {
    return this.id === this._sort.active && (this._sort.direction !== '');
  }

  updateArrowDirection(): void {
    this._arrowDirection = this.isSorted() ? this.arrowDirections[this._sort.direction] : this.arrowDirections[(this.start || this._sort.start)];
  }

  private handleSortChange() {
    this._sort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((_) => {
        this.updateArrowDirection();
        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._sort.deregister(this);
    this.destroy$.next();
    this.destroy$.complete();
  }

  over() {
    // will implement later
  }
}
