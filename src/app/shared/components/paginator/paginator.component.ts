import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {range as _range} from 'lodash';
import {debounceTime, distinctUntilChanged, filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {PageEvent} from '../../../interfaces/page-event';
import {FormControl} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent implements OnInit, OnDestroy {
  _pageSize: number = 10;

  _pagesList: number[] = [10, 20, 30, 50];

  pages: number[] = [];

  maxSize: number = 7;


  private pageIndex: number = 0;
  private previousPageIndex: number | null = null;

  private initialized = false;
  private _length: number = 0;
  private destroy$: Subject<any> = new Subject<any>();

  @Output()
  pageChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Input() small: boolean = false;

  itemsPerPageControl!: FormControl;
  goToControl!: FormControl;

  @Input()
  set pageSize(value: number) {
    this._pageSize = Number(value);
    if (this.initialized) {
      this.updatePaginationStatus();
    }
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
    if (this.initialized) {
      this.updatePaginationStatus();
    }
  }

  get length(): number {
    return this._length;
  }

  constructor(public lang: LangService, private cd: ChangeDetectorRef) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.itemsPerPageControl = new FormControl(this.pageSize);
    this.goToControl = new FormControl(1, CustomValidators.number);
    this.updatePaginationStatus();
    this.listenToLanguageChanges();
    this.listenToGoToControl();
    this.listenToItemsPerPageControl();
    this.initialized = true;
  }

  private updatePaginationStatus() {
    this.addPageSizeIfNotExists(this.pageSize);
    this.generatePages();
    this.cd.markForCheck();
  }

  private generatePages() {
    this.pages = _range(1, (Math.ceil(this.length / this.pageSize) + 1));
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

  goToPage(page: number, $event?: MouseEvent) {
    $event?.preventDefault();
    this.previousPageIndex = this.pageIndex;
    this.pageIndex = (page - 1);
    this.emitPaginationChange(this.previousPageIndex);
  }


  emitPaginationChange(previousPageIndex: number): void {
    this.pageChange.emit({
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }

  isCurrentPage(page: number) {
    return this.currentPage === page;
  }

  get startFrom(): number {
    return (this.pageIndex * this.pageSize) + 1;
  }

  get endTo(): number {
    return (this.pageIndex + 1) * this.pageSize;
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
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (this.isValidGoToPage(value)) {
          this.goToPage(value);
        } else {
          this.goToControl.patchValue(this.currentPage, {
            emitEvent: false
          });
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
        this.pageSize = value;
      });
  }
}
