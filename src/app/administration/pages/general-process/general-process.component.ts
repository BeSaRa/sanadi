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
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: GeneralProcess) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: GeneralProcess) => this.view$.next(item)
    },
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'actions'];

  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
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

  delete(model: GeneralProcess, event?: MouseEvent): void {
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
}
