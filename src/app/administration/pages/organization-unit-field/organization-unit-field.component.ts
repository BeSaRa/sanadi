import {OrganizationUnitField} from '@app/models/organization-unit-field';
import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {OrganizationUnitFieldService} from '@app/services/organization-unit-field.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Component({
  selector: "organization-unit-field",
  templateUrl: "./organization-unit-field.component.html",
  styleUrls: ["./organization-unit-field.component.scss"],
})
export class OrganizationUnitFieldComponent extends AdminGenericComponent<OrganizationUnitField,
  OrganizationUnitFieldService> {
  usePagination = true;
  actions: IMenuItem<OrganizationUnitField>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: OrganizationUnitField) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: OrganizationUnitField) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: OrganizationUnitField) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: OrganizationUnitField) => this.toggleStatus(item),
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
      onClick: (item: OrganizationUnitField) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  get selectedRecords(): OrganizationUnitField[] {
    return this.table.selection.selected;
  }

  sortingCallbacks = {
    statusInfo: (a: OrganizationUnitField, b: OrganizationUnitField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(
    public lang: LangService,
    public service: OrganizationUnitFieldService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService
  ) {
    super();
  };

  protected _init(): void {
    this.listenToView();
  }

  @ViewChild('table') table!: TableComponent;
  view$: Subject<OrganizationUnitField> = new Subject<OrganizationUnitField>();


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

  delete(model: OrganizationUnitField, event?: MouseEvent): void {
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

  toggleStatus(model: OrganizationUnitField) {
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
