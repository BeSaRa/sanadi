import { DynamicModel } from '@app/models/dynamic-model';
import { GeneralProcess } from '@app/models/genral-process';
import { UserClickOn } from './../../../enums/user-click-on.enum';
import { ToastService } from './../../../services/toast.service';
import { SharedService } from './../../../services/shared.service';
import { DialogService } from './../../../services/dialog.service';
import { LangService } from './../../../services/lang.service';
import { GeneralProcessService } from './../../../services/general-process.service';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { DialogRef } from './../../../shared/models/dialog-ref';
import { takeUntil, exhaustMap, catchError, filter, switchMap } from 'rxjs/operators';
import { TableComponent } from './../../../shared/components/table/table.component';
import { IMenuItem } from './../../../modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from './../../../enums/action-icons-enum';
import { IGridAction } from './../../../interfaces/i-grid-action';
import { CommonStatusEnum } from './../../../enums/common-status.enum';
import { Component, ViewChild } from '@angular/core';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-general-process',
  templateUrl: './general-process.component.html',
  styleUrls: ['./general-process.component.scss']
})
export class GeneralProcessComponent extends AdminGenericComponent<GeneralProcess, GeneralProcessService> {
  usePagination = true;
  list: GeneralProcess[] = [];
  commonStatusEnum = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;
  view$: Subject<GeneralProcess> = new Subject<GeneralProcess>();

  actions: IMenuItem<GeneralProcess>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: GeneralProcess) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: GeneralProcess) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: GeneralProcess) => this.toggleStatus(item),
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
      onClick: (item: GeneralProcess) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'actions'];

  bulkActionsList: IGridAction[] = [
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: GeneralProcess[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: GeneralProcess[]) => {
            return true;
          }
        }
      ],
    }
  ];
  constructor(
    public lang: LangService,
    public service: GeneralProcessService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService
  ) {
    super();
  }
  protected _init(): void {
    this.listenToView();
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  get selectedRecords(): GeneralProcess[] {
    return this.table.selection.selected;
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

  toggleStatus(model: GeneralProcess) {
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
