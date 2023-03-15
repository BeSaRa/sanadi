import {Component} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ServiceDataService} from '@services/service-data.service';
import {of, Subject} from 'rxjs';
import {ToastService} from '@services/toast.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {ServiceData} from '@app/models/service-data';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {DialogService} from '@services/dialog.service';
import {SharedService} from '@services/shared.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {DateUtils} from '@helpers/date-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AidLookupStatusEnum} from '@app/enums/status.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'service-data',
  templateUrl: './service-data.component.html',
  styleUrls: ['./service-data.component.scss']
})
export class ServiceDataComponent extends AdminGenericComponent<ServiceData, ServiceDataService> {
  commonStatus = CommonStatusEnum;
  useCompositeToEdit = false;
  usePagination = true;
  constructor(public langService: LangService,
              public service: ServiceDataService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
  }

  view$: Subject<ServiceData> = new Subject<ServiceData>();
  actions: IMenuItem<ServiceData>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: ServiceData) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: ServiceData) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: ServiceData) => this.toggleStatus(item),
      show: (item) => {
        return item.status !== AidLookupStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item: ServiceData) => this.toggleStatus(item),
      show: (item) => {
        return item.status !== AidLookupStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['bawServiceCode', 'arName', 'enName', 'updatedOn', 'updatedBy', 'status', 'actions'];
  sortingCallbacks = {
    updatedBy: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.updatedByInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.updatedByInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    updatedOn: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.updatedOn!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.updatedOn!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: ServiceData, b: ServiceData, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

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

  view(record: ServiceData) {
    this.view$.next(record);
  }

  toggleStatus(model: ServiceData) {
    let updateObservable = model.updateStatus(model.status);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }
}
