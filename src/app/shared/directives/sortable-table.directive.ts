import {Directive, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {SortEvent} from '../../interfaces/sort-event';
import {SortableHeaderComponent} from '../components/sortable-header/sortable-header.component';
import {BehaviorSubject} from 'rxjs';

@Directive({
  selector: '[sortableTable]'
})
export class SortableTableDirective implements OnInit, OnDestroy {
  @Input() start: string = 'asc';
  private sortableColumns: Map<string, SortableHeaderComponent> = new Map<string, SortableHeaderComponent>();
  private _direction: string = '';

  active: string = '';

  @Output()
  readonly sortChange: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();
  @Input() sortBack: boolean = false;

  initialized: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  set direction(val: string) {
    this._direction = val;
  }

  get direction(): string {
    return this._direction;
  }

  constructor() {
  }


  ngOnInit(): void {
    this.sortChange.emit({
      direction: this.direction,
      active: this.active
    });
  }

  registerColumn(column: SortableHeaderComponent): void {
    if (this.sortableColumns.has(column.id)) {
      throw Error('the sortable column without id');
    } else {
      this.sortableColumns.set(column.id, column);
    }
  }

  deregister(column: SortableHeaderComponent): void {
    this.sortableColumns.has(column.id) ? this.sortableColumns.delete(column.id) : null;
  }

  sort(column: SortableHeaderComponent): void {
    if (this.active !== column?.id) {
      this.active = column?.id ?? '';
      this.direction = column?.start || this.start;
    } else {
      this.direction = this.getNextSortDirection(column.start || this.start);
    }

    this.sortChange.emit({
      direction: this.direction,
      active: this.active
    });
  }


  private getNextSortDirection(sortStart: string): string {
    let directions = ['asc', 'desc'];
    if (sortStart === 'desc') {
      directions.reverse();
    }
    directions.push('');
    let directionIndex = directions.indexOf(this.direction) + 1;
    if (directionIndex >= directions.length) {
      directionIndex = 0;
    }
    return directions[directionIndex];
  }

  ngOnDestroy(): void {
  }
}
