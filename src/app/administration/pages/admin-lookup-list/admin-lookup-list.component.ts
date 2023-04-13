import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AdminLookup} from '@app/models/admin-lookup';
import {DacOchaService} from '@services/dac-ocha.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {LangService} from '@services/lang.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LookupService} from '@services/lookup.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {catchError, delay, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {PageEvent} from '@contracts/page-event';
import {FormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {SearchColumnConfigMap, SearchColumnEventType} from '@contracts/i-search-column-config';
import {CustomValidators} from '@app/validators/custom-validators';
import {Pagination} from '@models/pagination';

@Component({
  selector: 'admin-lookup-list',
  templateUrl: './admin-lookup-list.component.html',
  styleUrls: ['./admin-lookup-list.component.scss']
})
export class AdminLookupListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() adminLookupTypeId!: AdminLookupTypeEnum;
  @Input() parentId?: number;
  @Input() readonly: boolean = false;
  @Input() isRootLevel: boolean = true;
  @Input() deletable:boolean = false;
  @Output() onReady: EventEmitter<AdminLookupTypeEnum> = new EventEmitter<AdminLookupTypeEnum>();

  constructor(public lang: LangService,
              public dacOchaService: DacOchaService,
              public adminLookupService: AdminLookupService,
              private dialogService: DialogService,
              private toast: ToastService,
              private fb: FormBuilder,
              public lookupService: LookupService) {

  }

  usePagination = true;
  count: number = 0;

  pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
    previousPageIndex: null
  };

  ngOnInit(): void {
    this.listenToView();
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.buildFilterForm();
    this.listenToColumnFilter();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onReady.emit(this.adminLookupTypeId);
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @ViewChild('table') table!: TableComponent;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  selectedPopupTabName: string = 'basic';
  commonStatusEnum = CommonStatusEnum;
  actionIconsEnum = ActionIconsEnum;
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  models: AdminLookup[] = [];
  view$: Subject<AdminLookup> = new Subject<AdminLookup>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<AdminLookup> = new Subject<AdminLookup>();
  destroy$: Subject<any> = new Subject<any>();
  columnFilter$: Subject<SearchColumnEventType> = new Subject<any>();
  searchColumns: string[] = ['search_arName', 'search_enName', 'search_status', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }
  columnFilterForm!: UntypedFormGroup;
  isColumnFilterApplied: boolean = false;

  actions: IMenuItem<AdminLookup>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly,
      onClick: (item) => this.edit(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item) => this.view$.next(item)
    },
    // children
    {
      type: 'action',
      label: (_item) => {
        return this.lang.map.lbl_children_x.change({x: this.getTabLabel(this.adminLookupTypeId)});
      },
      icon: ActionIconsEnum.CHILD_ITEMS,
      show: (item) => {
        return !item.parentId && this.adminLookupService.adminLookupTypesWithChildren.includes(this.adminLookupTypeId);
      },
      onClick: (item) => this.showChildren(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: AdminLookup) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item: AdminLookup) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && item.status === CommonStatusEnum.ACTIVATED;
      }
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE_TRASH,
      label: 'btn_delete',
      onClick: (item: AdminLookup) => this.delete(item),
      show: () => {
        return !this.readonly && this.deletable;
      }
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusDateModified: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.statusDateModified),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.statusDateModified);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  getTabLabel(lookupType: AdminLookupTypeEnum): string {
    return (this.lookupService.listByCategory.AdminLookupType || []).find(classification => classification.lookupKey === lookupType)?.getName() || '';
  }

  resetColumnFilterAndReload(): void {
    this.isColumnFilterApplied = false;
    this.columnFilterForm.reset();
    this.reload$.next(this.reload$.value)
  }

  pageChange($event: PageEvent): void {
    this.pageEvent = $event;
    if (this.usePagination && this.pageEvent.previousPageIndex !== null) {
      if (!this.columnFilterFormHasValue()) {
        this.resetColumnFilterAndReload();
      } else {
        this.columnFilter$.next('filter');
      }
    }
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    });
  }

  getColumnFilterValue(): Partial<AdminLookup> {
    const value: Partial<AdminLookup> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.parentId = this.parentId ?? undefined;
      return value;
    }
    return {};
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  canShowHeader(): boolean {
    return !this.isRootLevel;
  }

  private _isWorkField() {
    return this.adminLookupTypeId === AdminLookupTypeEnum.WORK_FIELD || this.adminLookupTypeId === AdminLookupTypeEnum.OCHA || this.adminLookupTypeId === AdminLookupTypeEnum.DAC;
  }

  private _isGeneralProcessClassification() {
    return this.adminLookupTypeId === AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION;
  }

  private _afterReload() {
    this.table && this.table.clearSelection();
    this.filterControl.setValue(this.filterControl.value);
  }

  private _getSubRecordsRequest(columnFilterCriteria: Partial<AdminLookup>) {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };
    let normalRequest: Observable<AdminLookup[]> = this.adminLookupService.loadByParentId(this.adminLookupTypeId, this.parentId!);
    let pagingRequest: Observable<Pagination<AdminLookup[]>> = this.adminLookupService.loadByParentIdPaging(paginationOptions, this.adminLookupTypeId, this.parentId!);
    let normalColumnFilterRequest: Observable<AdminLookup[]> = this.adminLookupService.loadByFilter(this.adminLookupTypeId, columnFilterCriteria);
    let pagingColumnFilterRequest: Observable<Pagination<AdminLookup[]>> = this.adminLookupService.loadByFilterPaginate(paginationOptions, this.adminLookupTypeId, columnFilterCriteria);
    if (this._isWorkField()) {
      normalColumnFilterRequest = this.dacOchaService.loadByTypeFilter(this.adminLookupTypeId, columnFilterCriteria);
      pagingColumnFilterRequest = this.dacOchaService.paginateByTypeFilter(paginationOptions, this.adminLookupTypeId, columnFilterCriteria);
    }
    return {normalRequest, pagingRequest, normalColumnFilterRequest, pagingColumnFilterRequest};
  }

  private _getMainRecordsRequest(columnFilterCriteria: Partial<AdminLookup>) {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };

    let normalRequest: Observable<AdminLookup[]> = this.adminLookupService.loadComposite(this.adminLookupTypeId);
    let pagingRequest: Observable<Pagination<AdminLookup[]>> = this.adminLookupService.paginateComposite(paginationOptions, this.adminLookupTypeId);
    let normalColumnFilterRequest: Observable<AdminLookup[]> = this.adminLookupService.loadByFilter(this.adminLookupTypeId, columnFilterCriteria);
    let pagingColumnFilterRequest: Observable<Pagination<AdminLookup[]>> = this.adminLookupService.loadByFilterPaginate(paginationOptions, this.adminLookupTypeId, columnFilterCriteria);

    if (this._isWorkField()) {
      normalRequest = this.dacOchaService.loadByType(this.adminLookupTypeId);
      pagingRequest = this.dacOchaService.loadParentsByTypePaging(paginationOptions, this.adminLookupTypeId);
      normalColumnFilterRequest = this.dacOchaService.loadByTypeFilter(this.adminLookupTypeId, columnFilterCriteria);
      pagingColumnFilterRequest = this.dacOchaService.paginateByTypeFilter(paginationOptions, this.adminLookupTypeId, columnFilterCriteria);
    } else if (this._isGeneralProcessClassification()) {
      normalRequest = this.adminLookupService.loadComposite(this.adminLookupTypeId);
      pagingRequest = this.adminLookupService.loadParentsPaging(paginationOptions, this.adminLookupTypeId);
    }

    return {normalRequest, pagingRequest, normalColumnFilterRequest, pagingColumnFilterRequest};
  }

  listenToReload() {
    this.reload$
      .pipe(
        takeUntil(this.destroy$),
        filter((val) => val !== 'init'),
      )
      .pipe(
        filter(() => {
          if (this.columnFilterFormHasValue()) {
            this.columnFilter$.next('filter');
            return false;
          }
          return true;
        })
      )
      .pipe(
        map(() => {
          let request = this.parentId ? this._getSubRecordsRequest({}) : this._getMainRecordsRequest({});

          if (this.usePagination) {
            return request.pagingRequest.pipe(
              map((res) => {
                this.count = res.count;
                return res.rs;
              }));
          } else {
            return request.normalRequest.pipe(map((res) => {
              this.count = res.length;
              return res;
            }));
          }
        }),
        switchMap((finalRequest) => {
          return finalRequest.pipe(
            catchError(() => {
              this.count = 0;
              return of([]);
            })
          );
        })
      )
      .subscribe((list: AdminLookup[]) => {        
        this.models = list.filter(adminLookup => adminLookup.status !== CommonStatusEnum.RETIRED); //this.parentId ? list : list.filter(x => !x.parentId);
        this._afterReload();
      });
  }

  columnFilterFormHasValue(model?: Partial<AdminLookup>) {
    if (!model) {
      model = this.columnFilterForm?.value || false;
    }
    return CommonUtils.objectHasValue(model);
  }

  listenToColumnFilter() {
    this.columnFilter$
      .pipe(takeUntil((this.destroy$)))
      .pipe(
        delay(500),
        map((eventType: SearchColumnEventType) => {
          if (eventType === 'clear') {
            return {};
          }
          return this.getColumnFilterValue();
        }),
        filter((criteria) => {
          const hasFilterCriteria = this.columnFilterFormHasValue(criteria);
          if (!hasFilterCriteria) {
            if (this.isColumnFilterApplied) {
              this.reload$.next(null);
            }
            this.isColumnFilterApplied = false;
            return false;
          } else {
            this.isColumnFilterApplied = true;
            return true;
          }
        }),
      )
      .pipe(
        map((criteria: Partial<AdminLookup>) => {
          let request = this.parentId ? this._getSubRecordsRequest(criteria) : this._getMainRecordsRequest(criteria);

          if (this.usePagination) {
            return request.pagingColumnFilterRequest.pipe(
              map((res) => {
                this.count = res.count;
                return res.rs;
              }));
          } else {
            return request.normalColumnFilterRequest.pipe(map((res) => {
              this.count = res.length;
              return res;
            }));
          }
        }),
        switchMap((finalRequest) => {
          return finalRequest.pipe(
            catchError(() => {
              this.count = 0;
              return of([]);
            })
          );
        })
      )
      .subscribe((list: AdminLookup[]) => {
        this.count = list.length;
        this.models = list;
        this._afterReload();
      })
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap(() => this.adminLookupService.openCreateDialog(this.adminLookupTypeId, this.parentId).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap((model) => {
        return this.adminLookupService.openUpdateDialog(model.id, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  edit(item: AdminLookup, event?: MouseEvent) {
    if (this.readonly) {
      return;
    }
    event?.preventDefault();
    this.selectedPopupTabName = 'basic';
    this.edit$.next(item);
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.adminLookupService.openViewDialog(model.id).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe();
  }

  showChildren(item: AdminLookup, $event?: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'children';

    if (this.readonly) {
      this.view$.next(item);
    } else {
      this.edit$.next(item);
    }
  }

  toggleStatus(model: AdminLookup, $event?: MouseEvent) {
    if (this.readonly) {
      $event?.preventDefault();
      return;
    }
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      },()=> this.reload$.next(null));
  }
  delete(model: AdminLookup, $event?: MouseEvent) {
    if (this.readonly) {
      $event?.preventDefault();
      return;
    }
    model.delete(model.id).pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, ()=> this.reload$.next(null));
  }

}
