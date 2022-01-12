import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {Subject} from "rxjs";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {FormControl} from "@angular/forms";
import {FilterEventTypes} from "@app/types/types";
import {isEmptyObject, objectHasValue} from "@app/helpers/utils";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {DialogService} from "@app/services/dialog.service";
import {takeUntil} from "rxjs/operators";
import {SortableTableDirective} from "@app/shared/directives/sortable-table.directive";

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit, OnDestroy {
  @Input()
  reload$!: Subject<any>;
  @Input()
  tableTitle!: keyof ILanguageKeys;
  filterControl: FormControl = new FormControl();
  @Output()
  filterClicked: EventEmitter<FilterEventTypes> = new EventEmitter<FilterEventTypes>();
  @Input()
  filterCriteria: any;
  @Output()
  textChange: EventEmitter<string> = new EventEmitter<string>();
  @Input()
  sort: SortableTableDirective | undefined | null;
  hasSort: boolean = false;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public lang: LangService, private dialog: DialogService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToFilterChange();
    this.listenToSort();
  }

  private listenToSort() {
    if (!this.sort) {
      return;
    }
    this.sort.sortChange.subscribe((sort) => {
      this.hasSort = !!sort.direction;
    });
  }

  private listenToFilterChange() {
    this.filterControl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.textChange.emit(value);
      })
  }

  hasFilterCriteria(): boolean {
    return !isEmptyObject(this.filterCriteria) && objectHasValue(this.filterCriteria);
  }

  clearFilter(): void {
    if (!this.hasFilterCriteria()) {
      return;
    }
    this.dialog.confirm(this.lang.map.msg_confirm_clear_filter_criteria, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel'
    }).onAfterClose$
      .subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          this.filterClicked.emit('CLEAR');
        }
      })
  }

  clearSort() {
    this.sort && this.sort.clearSort();
  }
}
