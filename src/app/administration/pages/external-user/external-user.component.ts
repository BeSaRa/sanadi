import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {Component, ViewChild} from '@angular/core';
import {ExternalUser} from '@app/models/external-user';
import {ExternalUserService} from '@services/external-user.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {EmployeeService} from '@app/services/employee.service';
import {SharedService} from '@app/services/shared.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TableComponent} from '@app/shared/components/table/table.component';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {of, Subject} from 'rxjs';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'app-external-user',
  templateUrl: './external-user.component.html',
  styleUrls: ['./external-user.component.scss']
})
export class ExternalUserComponent extends AdminGenericComponent<ExternalUser, ExternalUserService> {
  view$: Subject<ExternalUser> = new Subject<ExternalUser>();
  usePagination = true;

  constructor(public service: ExternalUserService,
              public langService: LangService,
              private toast: ToastService,
              public configService: ConfigurationService,
              public empService: EmployeeService,
              private dialogService: DialogService,
              private sharedService: SharedService) {
    super();
  }

  _init() {
    this.listenToLoadDone();
    this.listenToView();
  }

  @ViewChild('table') table!: TableComponent;

  displayedColumns: string[] = ['domainName', 'arName', 'enName', 'empNum', 'organization', 'status', 'statusDateModified', 'actions'];

  sortingCallbacks = {
    organization: (a: ExternalUser, b: ExternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.profileInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.profileInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: ExternalUser, b: ExternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  commonStatusEnum = CommonStatusEnum;
  bulkActionsList: IGridAction[] = [
    // {
    //   langKey: 'btn_delete',
    //   icon: 'mdi-close-box',
    //   callback: ($event: MouseEvent) => {
    //     this.deactivateBulk($event);
    //   }
    // }
  ];

  actions: IMenuItem<ExternalUser>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: item => this.edit$.next(item),
      show: () => this.empService.checkPermissions(this.permissionsEnum.EDIT_ORG_USER)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: item => this.view$.next(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return this.empService.checkPermissions(this.permissionsEnum.EDIT_ORG_USER)
          && (item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED);
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return this.empService.checkPermissions(this.permissionsEnum.EDIT_ORG_USER)
          && (item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED);
      }
    }
  ];

  get selectedRecords(): ExternalUser[] {
    return this.table.selection.selected;
  }

  deactivate(model: ExternalUser, event?: MouseEvent): void {
    event?.preventDefault();
    // @ts-ignore
    const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.user.toLowerCase()}) + '<br/>' +
      this.langService.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.deactivate().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deactivateBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users.toLowerCase()}) + '<br/>' +
        this.langService.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deactivateBulk(ids).subscribe((response) => {
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

  edit(orgUser: ExternalUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.edit$.next(orgUser);
  }

  listenToLoadDone(): void {
    this.service._loadDone$
      .pipe(takeUntil((this.destroy$)))
      .subscribe(() => {
        this.table && this.table.clearSelection();
      });
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

  showAuditLogs(user: ExternalUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    user.showAuditLogs($event)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  toggleStatus(model: ExternalUser) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe((_value) => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }
}
