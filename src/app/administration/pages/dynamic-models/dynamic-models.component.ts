import { DynamicModel } from './../../../models/dynamic-model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicModelService } from '@app/services/dynamic-models.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Subject, of } from 'rxjs';
import { takeUntil, exhaustMap, catchError, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-models',
  templateUrl: './dynamic-models.component.html',
  styleUrls: ['./dynamic-models.component.scss']
})
export class DynamicModelsComponent extends AdminGenericComponent<DynamicModel, DynamicModelService> {
  usePagination = true;
  list: DynamicModel[] = [];
  commonStatusEnum = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;
  view$: Subject<DynamicModel> = new Subject<DynamicModel>();

  actions: IMenuItem<DynamicModel>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: DynamicModel) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: DynamicModel) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: DynamicModel) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: DynamicModel) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: DynamicModel) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'actions'];

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
          show: (_items: DynamicModel[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: DynamicModel[]) => {
            return true;
          }
        }
      ],
    }
  ];

  constructor(
    public lang: LangService,
    public service: DynamicModelService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService
  ) {
    super();
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

  protected _init(): void {
    this.listenToView();
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  get selectedRecords(): DynamicModel[] {
    return this.table.selection.selected;
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  delete(model: DynamicModel, event?: MouseEvent): void {
    event?.preventDefault();
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

  toggleStatus(model: DynamicModel) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        // this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }
}
