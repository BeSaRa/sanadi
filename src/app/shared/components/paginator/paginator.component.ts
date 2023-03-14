import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {debounceTime, distinctUntilChanged, filter, takeUntil} from 'rxjs/operators';
import {merge, Subject} from 'rxjs';
import {PageEvent} from '@app/interfaces/page-event';
import {UntypedFormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent implements OnInit, OnDestroy {
  _pageSize: number = 10;
  _pagesList: number[] = [10, 20, 30, 50];
  pages: any[] = [];
  @Input()
  maxSize: number = 7;

  @Input()
  backend: boolean = false;
  @Input()
  slaves?: PaginatorComponent[]

  pageIndex: number = 0;
  private previousPageIndex: number | null = null;
  private _length: number = 0;
  private destroy$: Subject<any> = new Subject<any>();

  @Output()
  pageChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Input() small: boolean = true;

  itemsPerPageControl!: UntypedFormControl;
  goToControl!: UntypedFormControl;
  totalPages: number = 0;

  @Input()
  set pageSize(value: number) {
    this._pageSize = Number(value);
    this.updatePaginationStatus();
  };

  get pageSize(): number {
    return this._pageSize;
  }

  @Input()
  set pagesList(val: number[]) {
    this._pagesList = val;
  }

  get pagesList(): number[] {
    return this._pagesList;
  }

  @Input()
  set length(val: number) {
    this._length = Number(val);
    this.updatePaginationStatus();
    this.updateSlaves(this.getPaginationState());
  }

  get length(): number {
    return this._length;
  }

  private readonly emitter: string;

  constructor(public lang: LangService, private cd: ChangeDetectorRef) {
    this.emitter = PaginatorComponent.randomId();
  }

  private static randomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.itemsPerPageControl = new UntypedFormControl(this.pageSize);
    this.goToControl = new UntypedFormControl(1, CustomValidators.number);
    this.updatePaginationStatus();
    this.emitPaginationChange(this.previousPageIndex);
    this.listenToLanguageChanges();
    this.listenToGoToControl();
    this.listenToItemsPerPageControl();

    this.listenToSlaves();
  }

  private updatePaginationStatus() {
    this.addPageSizeIfNotExists(this.pageSize);
    this.generatePages(this.currentPage);
    const currentPage = this.outOfBoundCorrection();
    if (currentPage !== this.currentPage) {
      this.goToPage({page: currentPage});
    }
    this.cd.markForCheck();
  }

  private generatePages(currentPage: number) {
    this.pages = [];
    this.totalPages = Math.max(Math.ceil(this.length / this.pageSize), 1);
    const halfPages = Math.ceil(this.maxSize / 2);

    const isStart = currentPage <= halfPages;
    const isEnd = (this.totalPages - halfPages) < currentPage;
    const isMiddle = !isStart && !isEnd;

    let ellipsesNeeded = this.maxSize < this.totalPages;
    let i = 1;

    while (i <= this.maxSize && i <= this.totalPages) {
      let label;
      let pageNumber = this.calculatePageNumber(i);
      let openingEllipsesNeeded = (i === 2 && (isMiddle || isEnd));
      let closingEllipsesNeeded = (i === this.maxSize - 1 && (isMiddle || isStart));
      if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
        label = '...';
      } else {
        label = pageNumber;
      }
      this.pages.push({
        label: label,
        page: pageNumber
      });
      i++;
    }
  }

  private listenToLanguageChanges() {
    this.lang.onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cd.markForCheck();
      });
  }

  get currentPage(): number {
    return this.pageIndex + 1;
  }

  goToPage(page: any, ignoreSlaves?: boolean) {
    if (this.pageIndex === page.page - 1) {
      return;
    }
    this.previousPageIndex = this.pageIndex;
    this.pageIndex = (page.page - 1);
    this.goToControl.patchValue(page.page, {emitEvent: false});
    this.emitPaginationChange(this.previousPageIndex);
    this.updatePaginationStatus();
  }


  emitPaginationChange(previousPageIndex: number | null): void {
    const pageEvent: PageEvent = {
      ...this.getPaginationState(),
      previousPageIndex
    }
    this.pageChange.emit(pageEvent);
    this.updateSlaves(pageEvent);
  }

  setPaginationChanges(event: PageEvent, updateFromSlaves: boolean = false): void {
    if (this.emitter === event.emitter) {
      return
    }
    this.previousPageIndex = event.previousPageIndex;
    this.pageIndex = event.pageIndex;
    this._pageSize = event.pageSize;
    this._length = event.length;
    this.itemsPerPageControl.patchValue(event.pageSize, {emitEvent: false});
    this.updatePaginationStatus();
    if (updateFromSlaves) {
      this.emitPaginationChange(this.previousPageIndex);
    }
  }

  getPaginationState(): PageEvent {
    return {
      previousPageIndex: this.previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length,
      emitter: this.emitter
    }
  }

  isCurrentPage(page: any) {
    return this.currentPage === page.page;
  }

  get startFrom(): number {
    return this._length === 0 ? 0 : (this.pageIndex * this.pageSize) + 1;
  }

  get endTo(): number {
    const number = (this.pageIndex + 1) * this.pageSize;
    return number > this._length ? this._length : number;
  }

  private addPageSizeIfNotExists(pageSize: number) {
    this._pagesList.indexOf(pageSize) === -1 ? this._pagesList.push(pageSize) : null;
    this._pagesList.sort((a, b) => a - b);
  }

  private listenToGoToControl() {
    this.goToControl.valueChanges
      .pipe(
        filter(val => !!val),
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (this.isValidGoToPage(value)) {
          this.goToPage({page: value});
        } else {
          this.goToControl.patchValue(this.currentPage, {
            emitEvent: false
          });
          this.updateSlaves(this.getPaginationState());
        }
      });
  }

  private isValidGoToPage(val: number): boolean {
    return val > 0 && val <= Math.ceil(this.length / this.pageSize);
  }

  inputFocused($event: FocusEvent) {
    const input = $event.target as HTMLInputElement;
    input.select();
  }

  inputBlur() {
    if (!this.goToControl.value) {
      this.goToControl.patchValue(this.currentPage, {
        emitEvent: false
      });
    }
  }

  private listenToItemsPerPageControl() {
    this.itemsPerPageControl.valueChanges
      .pipe(
        filter(val => !!val),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this._pageSize = value;
        this.updatePaginationStatus();
        this.emitPaginationChange(this.previousPageIndex ?? 0);
      });
  }

  private outOfBoundCorrection(): number {
    const totalPages = Math.ceil(this.length / this.pageSize);
    if (totalPages < this.currentPage && 0 < totalPages) {
      return totalPages;
    } else if (this.currentPage < 1) {
      return 1;
    }
    return this.currentPage;
  }

  private calculatePageNumber(i: number) {
    let halfWay = Math.ceil(this.maxSize / 2);
    if (i === this.maxSize) {
      return this.totalPages;
    } else if (i === 1) {
      return i;
    } else if (this.maxSize < this.totalPages) {
      if (this.totalPages - halfWay < this.currentPage) {
        return this.totalPages - this.maxSize + i;
      } else if (halfWay < this.currentPage) {
        return this.currentPage - halfWay + i;
      } else {
        return i;
      }
    } else {
      return i;
    }
  }

  hasPrev(): boolean {
    return this.currentPage > 1;
  }

  hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  goToPrev(): void {
    this.goToPage({page: this.currentPage - 1});
  }

  goToNext(): void {
    this.goToPage({page: this.currentPage + 1});
  }

  private listenToSlaves(): void {
    if (!this.slaves) {
      return;
    }
    merge(...this.slaves.map(p => p.pageChange))
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.setPaginationChanges(event, true);
        this.updateSlaves(event); // in case if we have more than one slave we should update the others
      });
  }

  private updateSlaves(event: PageEvent) {
    this.slaves?.forEach(p => p.setPaginationChanges(event));
  }
}
