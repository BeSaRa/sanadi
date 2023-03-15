import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {DonorService} from '@services/donor.service';
import {Donor} from '@app/models/donor';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {SharedService} from '@services/shared.service';
import {ToastService} from '@services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {of, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {IGridAction} from '@contracts/i-grid-action';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'donor',
  templateUrl: './donor.component.html',
  styleUrls: ['./donor.component.scss']
})
export class DonorComponent extends AdminGenericComponent<Donor, DonorService> {
  prepareFilterModel(): Partial<Donor> {
    throw new Error('Method not implemented.');
  }
  usePagination = true;

  constructor(public lang: LangService,
              public service: DonorService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status','statusDateModified', 'actions'];

  view$: Subject<Donor> = new Subject<Donor>();
  actions: IMenuItem<Donor>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: Donor) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: Donor) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: Donor) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: Donor) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: Donor) => this.toggleStatus(item),
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
          show: (_items: Donor[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: Donor[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: Donor, b: Donor, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  get selectedRecords(): Donor[] {
    return this.table.selection.selected;
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
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

  delete(model: Donor): void {
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
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

  toggleStatus(model: Donor) {
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
