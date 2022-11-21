import { Component, ViewChild } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { SortEvent } from '@app/interfaces/sort-event';
import { JobTitleClone } from '@app/models/job-title-clone';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { JobTitleCloneService } from '@app/services/job-title-clone.service';
import { LangService } from '@app/services/lang.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'job-title-clone',
  templateUrl: './job-title-clone.component.html',
  styleUrls: ['./job-title-clone.component.scss']
})
export class JobTitleCloneComponent extends AdminGenericComponent<JobTitleClone,JobTitleCloneService> {
  constructor(
    public lang: LangService,
    public service: JobTitleCloneService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService
  ) {super()}
  
  @ViewChild('table') table!:TableComponent;
  view$: Subject<JobTitleClone> = new Subject<JobTitleClone>();
  commonStatusEnum = CommonStatusEnum;
  usePagination = true;
  get selectedRecords(): JobTitleClone[] {
    return this.table.selection.selected;
  }
  bulkActionList: IGridAction[] = [
    {langKey:'btn_delete',icon:'mdi-close-box'},
    {langKey:'lbl_status', icon:'mdi-list-status', children:[
      {langKey:'btn_activate', icon:''},
      {langKey:'btn_deactivate', icon:''}
    ]}
  ]
  // service!: JobTitleCloneService;
  actions: IMenuItem<JobTitleClone>[] = [
    {type:'action', label:'btn_edit', icon:ActionIconsEnum.EDIT, onClick: (item: JobTitleClone) => this.edit$.next(item)},
    {type:'action', label:'btn_delete', icon:ActionIconsEnum.DELETE, onClick: (item: JobTitleClone) => this.delete(item)},
    {type:'action', label:'view', icon:ActionIconsEnum.VIEW, onClick: (item: JobTitleClone) => this.view$.next(item)},
    {type:'action', label:'btn_activate', icon:ActionIconsEnum.STATUS, onClick: (item: JobTitleClone) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }},
    {type:'action', label:'btn_deactivate', icon:ActionIconsEnum.STATUS, onClick: (item: JobTitleClone) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }},
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
          show: (_items: JobTitleClone[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: JobTitleClone[]) => {
            return true;
          }
        }
      ],
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];

  afterReload() {
    this.table && this.table.clearSelection()
  }
  
  sortingCallbacks = {
    statusInfo: (a: JobTitleClone, b: JobTitleClone, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  toggleStatus(model:JobTitleClone){
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        this.reload$.next(null);
      });
  }
  delete(model:JobTitleClone){
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }
  deleteBulk($event: MouseEvent) {
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
  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum){
    const sub = this.service.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
    .subscribe((response) => {
      this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
        .subscribe(() => {
          this.reload$.next(null);
          sub.unsubscribe();
        });
    });
  }
  listenToView(){
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
  protected _init(): void {
    this.listenToView();
  }
}
