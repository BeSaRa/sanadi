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
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {PageEvent} from '@contracts/page-event';
import {UntypedFormControl} from '@angular/forms';
import {Pagination} from '@app/models/pagination';

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
  @Output() onReady: EventEmitter<AdminLookupTypeEnum> = new EventEmitter<AdminLookupTypeEnum>();

  constructor(public lang: LangService,
              public dacOchaService: DacOchaService,
              public adminLookupService: AdminLookupService,
              private dialogService: DialogService,
              private toast: ToastService,
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

  pageChange($event: PageEvent): void {
    this.pageEvent = $event;
    if (this.usePagination && this.pageEvent.previousPageIndex !== null) {
      this.reload$.next(this.reload$.value);
    }
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

  private _getSubRecordsRequest() {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };
    let normalSubRequest = this.adminLookupService.loadByParentId(this.adminLookupTypeId, this.parentId!),
      pagingSubRequest = this.adminLookupService.loadByParentIdPaging(paginationOptions, this.adminLookupTypeId, this.parentId!);

    return {normalRequest: normalSubRequest, pagingRequest: pagingSubRequest};
  }

  private _getMainRecordsRequest() {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };

    let normalRequest: Observable<AdminLookup[]>,
      pagingRequest: Observable<Pagination<AdminLookup[]>>;

    if (this._isWorkField()) {
      normalRequest = this.dacOchaService.loadByType(this.adminLookupTypeId);
      pagingRequest = this.dacOchaService.loadParentsByTypePaging(paginationOptions, this.adminLookupTypeId);
    }
    else if (this._isGeneralProcessClassification()) {
      normalRequest = this.adminLookupService.loadComposite(this.adminLookupTypeId);
      pagingRequest = this.adminLookupService.loadParentsPaging(paginationOptions, this.adminLookupTypeId);
    } else {
      normalRequest = this.adminLookupService.loadComposite(this.adminLookupTypeId);
      pagingRequest = this.adminLookupService.paginateComposite(paginationOptions, this.adminLookupTypeId);
    }

    return {normalRequest, pagingRequest};
  }

  listenToReload() {
    this.reload$
      .pipe(
        takeUntil(this.destroy$),
        filter((val) => val !== 'init')
      )
      .pipe(
        map(() => {
          let request = this.parentId ? this._getSubRecordsRequest() : this._getMainRecordsRequest();

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
        this.models = this.parentId ? list : list.filter(x => !x.parentId);
        this._afterReload();
      });
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
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }

}
