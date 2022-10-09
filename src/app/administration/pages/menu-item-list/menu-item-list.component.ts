import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { SortEvent } from '@app/interfaces/sort-event';
import { AdminLookup } from '@app/models/admin-lookup';
import { MenuItemList } from '@app/models/menu-item-list';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { MenuItemListService } from '@app/services/menu-item-list.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { of, Subject } from 'rxjs';
import { takeUntil, exhaustMap, catchError, switchMap ,filter} from 'rxjs/operators';

@Component({
  selector: 'app-menu-item-list',
  templateUrl: './menu-item-list.component.html',
  styleUrls: ['./menu-item-list.component.css'],
})
export class MenuItemListComponent
  extends AdminGenericComponent<MenuItemList, MenuItemListService>

{
  usePagination = false;
  useCompositeToLoad=false


  displayedColumns: string[] =[
    'rowSelection',
    'arName',
    'enName',
    'status',
    'actions',
  ];;



  constructor(
    public lang: LangService,
    public service: MenuItemListService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService
  ) {
    super();
  }

  protected _init(): void {
    this.listenToView();
  }

  @ViewChild('table') table!: TableComponent;
  selectedPopupTabName: string = 'basic';
  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  get selectedRecords(): MenuItemList[] {
    return this.table.selection.selected;
  }
  view$: Subject<MenuItemList> = new Subject<MenuItemList>();

  commonStatusEnum = CommonStatusEnum;

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
  sortingCallbacks = {
    statusInfo: (a: MenuItemList, b: MenuItemList, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }
  edit(model: MenuItemList, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(model);
  }

  view(model: MenuItemList, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(model);
  }

  delete(model: MenuItemList): void {
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }
  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.service.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: MenuItemList) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }

  actions: IMenuItem<MenuItemList>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: MenuItemList) => this.edit$.next(item),
    },
     // sub childrin
     {
      type: 'action',
      label: (_item) => {
        return this.lang.map.sub_lists;
      },
      icon: ActionIconsEnum.CHILD_ITEMS,
      onClick: (item) => this.showChildren(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: MenuItemList) => this.view$.next(item),
    },
     // delete
     {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => true,
      onClick: (item) => this.delete(item)
    },
  ];
  showChildren(item: MenuItemList, $event?: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'sub';
    this.service.openEditDialog(item,this.selectedPopupTabName);
  }
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      },
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) =>
            this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: MenuItemList[]) => {
            return true;
          },
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) =>
            this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: MenuItemList[]) => {
            return true;
          },
        },
      ],
    },
  ];

}
