import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {BehaviorSubject, Subject} from "rxjs";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {UntypedFormControl} from "@angular/forms";
import {FilterEventTypes} from "@app/types/types";
import {objectHasValue} from "@app/helpers/utils";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {DialogService} from "@app/services/dialog.service";
import {takeUntil} from "rxjs/operators";
import {SortableTableDirective} from "@app/shared/directives/sortable-table.directive";
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@app/services/lookup.service";
import {IStats} from "@app/interfaces/istats";
import {CommonUtils} from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit, OnDestroy {
  @Input()
  reload$!: BehaviorSubject<any>;
  @Input()
  tableTitle!: keyof ILanguageKeys;
  filterControl: UntypedFormControl = new UntypedFormControl();
  @Output()
  filterClicked: EventEmitter<FilterEventTypes> = new EventEmitter<FilterEventTypes>();
  @Input()
  filterCriteria: any;
  @Output()
  textChange: EventEmitter<string> = new EventEmitter<string>();
  @Input()
  sort: SortableTableDirective | undefined | null;
  @Input()
  stats?: IStats;
  @Output()
  onSelectFilter: EventEmitter<Lookup | undefined> = new EventEmitter<Lookup | undefined>();

  hasSort: boolean = false;
  private destroy$: Subject<any> = new Subject<any>();
  riskStatus: Lookup[] = this.lookupService.listByCategory.RiskStatus.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  @Input()
  useReloadValue: boolean = false;

  @Input()
  customTemplate?: TemplateRef<any>;

  @Input() allowReload: boolean = true;

  @Input() add$: Subject<any> = {} as Subject<any>;
  @Input() allowAdd: boolean = true;
  @Input() headerClass: string = '';
  @Input() skipClearSort: boolean = false;
  @Input() skipSearch: boolean = false;

  riskStatusClasses: Record<number, string> = {
    1: 'btn-success',
    2: 'btn-warning',
    3: 'btn-danger',
  }
  riskCounter: Record<number, keyof IStats> = {
    1: "onTrack",
    2: "atRisk",
    3: "overdue",
  }

  selectedFilter?: Lookup;
  actionIconsEnum = ActionIconsEnum;

  constructor(public lang: LangService,
              private lookupService: LookupService,
              private dialog: DialogService) {

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

  clearSearch($event: MouseEvent) {
    $event?.preventDefault();
    this.filterControl.setValue('');
  }

  hasFilterCriteria(): boolean {
    return !CommonUtils.isEmptyObject(this.filterCriteria) && objectHasValue(this.filterCriteria);
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

  selectFilter(filter: Lookup) {
    if (this.selectedFilter && filter === this.selectedFilter) {
      this.selectedFilter = undefined;
      this.onSelectFilter.emit(undefined);
    } else {
      this.selectedFilter = filter;
      this.onSelectFilter.emit(filter);
    }
  }

  get isAddAvailable(): boolean {
    return !CommonUtils.isEmptyObject(this.add$) && this.allowAdd;
  }

  add() {
    this.add$.next(null);
  }

  get isReloadAvailable(): boolean {
    return !CommonUtils.isEmptyObject(this.reload$) && this.allowReload;
  }

  reload() {
    this.reload$.next(this.useReloadValue ? this.reload$.value : null);
    this.selectedFilter = undefined;
    this.onSelectFilter.emit(undefined);
  }

  isSelected(filter: Lookup) {
    return filter === this.selectedFilter;
  }
}
