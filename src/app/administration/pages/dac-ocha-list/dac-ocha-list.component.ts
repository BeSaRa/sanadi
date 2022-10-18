import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {AdminLookup} from '@app/models/admin-lookup';
import {LangService} from '@services/lang.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {of, Subject} from 'rxjs';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {DacOchaService} from '@services/dac-ocha.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {DialogService} from '@services/dialog.service';
import {SharedService} from '@services/shared.service';
import {ToastService} from '@services/toast.service';
import {LookupService} from '@services/lookup.service';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@contracts/i-grid-action';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';

@Component({
  selector: 'dac-ocha-list',
  templateUrl: './dac-ocha-list.component.html',
  styleUrls: ['./dac-ocha-list.component.scss']
})
export class DacOchaListComponent extends AdminGenericComponent<AdminLookup, DacOchaService> implements AfterViewInit {

  @Input() adminLookupType!: AdminLookupTypeEnum;
  @Output() onReady: EventEmitter<AdminLookupTypeEnum> = new EventEmitter<AdminLookupTypeEnum>();

  constructor(public lang: LangService,
              public service: DacOchaService,
              public adminLookupService: AdminLookupService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              public lookupService: LookupService) {
    super();
  }

  usePagination = true;
  filterRetired = true;

  _init(): void {
    this.listenToView();
  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.onReady.emit(this.adminLookupType);
    }, 100)
  }

  @ViewChild('table') table!: TableComponent;
  selectedPopupTabName: string = 'basic';
  commonStatusEnum = CommonStatusEnum;
  actionIconsEnum = ActionIconsEnum;
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  view$: Subject<AdminLookup> = new Subject<AdminLookup>();

  actions: IMenuItem<AdminLookup>[] = [
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: (_item) => false,
      onClick: (item) => this.delete(item)
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.edit(item)
    },
    // sub dac ocha
    {
      type: 'action',
      label: (_item) => {
        return this.lang.map.sub_dac_ochas.change({x: this.getTabLabel(this.adminLookupType)});
      },
      icon: ActionIconsEnum.CHILD_ITEMS,
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
        return item.status === CommonStatusEnum.DEACTIVATED;
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
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: AdminLookup[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: AdminLookup[]) => {
            return true;
          }
        }
      ],
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

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const paginationOptions = {
          limit: this.pageEvent.pageSize,
          offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
        };
        return this.service.loadByTypePaging(paginationOptions, this.adminLookupType)
          .pipe(
            map((res) => {
              this.count = res.count;
              return res.rs;
            }))
          .pipe(catchError(_ => {
            console.log('Error', _);
            return of([]);
          }));
      }))
      .subscribe((list: AdminLookup[]) => {
        if (this.filterRetired) {
          list = list.filter((item) => {
            return !item.parentId && item.status !== CommonStatusEnum.RETIRED;
          });
        }
        if (!this.usePagination) {
          this.count = list.length;
        }

        this.models = list;
        this.afterReload();
      });
  }

  afterReload() {
    this.table.clearSelection();
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.adminLookupType).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openUpdateDialog(model.id, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  edit(item: AdminLookup, event?: MouseEvent) {
    event?.preventDefault();
    this.selectedPopupTabName = 'basic';
    this.edit$.next(item);
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  showChildren(item: AdminLookup, $event?: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'children';
    this.edit$.next(item);
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    if (!this.table.selection || this.table.selection.selected.length === 0) {
      return;
    }
    const sub = this.adminLookupService.updateStatusBulk(this.table.selection.selected.map(item => item.id), this.adminLookupType, newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: AdminLookup) {
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

  delete(model: AdminLookup, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete(this.adminLookupType).subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.table.selection.selected.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.table.selection.selected.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response)
              .subscribe(() => {
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

}
