import {Component, Input} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {FollowupConfigurationService} from '@app/services/followup-configuration.service';
import {LangService} from '@app/services/lang.service';
import {ServiceData} from '@app/models/service-data';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable, of, Subject} from 'rxjs';
import {UntypedFormControl} from '@angular/forms';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Component({
  selector: 'followup-configuration',
  templateUrl: './followup-configuration.component.html',
  styleUrls: ['./followup-configuration.component.scss']
})
export class FollowupConfigurationComponent extends AdminGenericComponent<FollowupConfiguration, FollowupConfigurationService> {

  constructor(public lang: LangService,
              public service: FollowupConfigurationService,
              private dialog: DialogService,
              private toast: ToastService) {
    super();
  }

  displayedColumns: string[] = ['name', 'followUpType', 'requestType', 'responsibleTeamId', 'concernedTeamId', 'days', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  add$: Subject<any> = new Subject<any>();
  view$: Subject<any> = new Subject<any>();
  @Input() serviceData!: ServiceData;
  @Input() readonly: boolean = false;
  commonStatus = CommonStatusEnum;

  sortingCallbacks = {
    name: (a: FollowupConfiguration, b: FollowupConfiguration, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    followupType: (a: FollowupConfiguration, b: FollowupConfiguration, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.followUpTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.followUpTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestType: (a: FollowupConfiguration, b: FollowupConfiguration, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    responsibleTeam: (a: FollowupConfiguration, b: FollowupConfiguration, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.responsibleTeamInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.responsibleTeamInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    concernedTeam: (a: FollowupConfiguration, b: FollowupConfiguration, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.concernedTeamInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.concernedTeamInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
  actions: IMenuItem<FollowupConfiguration>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly,
      onClick: (item: FollowupConfiguration) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      show: () => this.readonly,
      onClick: (item: FollowupConfiguration) => this.view$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.DELETE,
      show: () => !this.readonly,
      onClick: (item: FollowupConfiguration) => this.delete(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: FollowupConfiguration) => this.toggleStatus(item),
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
      onClick: (item: FollowupConfiguration) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];

  _init() {
    this.listenToView();
    this.reload$.next(this.serviceData.caseType);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((caseType: number) => {
        return this.service.getByCaseType(caseType);
      }))
      .subscribe((list: FollowupConfiguration[]) => {
        this.models = list;
      });
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return (this.useCompositeToEdit ?
          this.service.editDialogComposite(model).pipe(catchError(_ => of(null))) :
          this.service.editDialog(model).pipe(catchError(_ => of(null))));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(this.serviceData.caseType));
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(this.serviceData.caseType));
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        const result = this.service.addDialogWithDefaults(this.serviceData.id, this.serviceData.caseType);
        if (result instanceof DialogRef) {
          return result.onAfterClose$;
        } else {
          return result.pipe(switchMap(ref => ref.onAfterClose$));
        }
      }))
      .subscribe(() => this.reload$.next(this.serviceData.caseType));
  }

  delete(model: FollowupConfiguration) {
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialog.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(this.serviceData.caseType);
          sub.unsubscribe();
        });
      }
    });
  }

  toggleStatus(model: FollowupConfiguration) {
    let message: string, updateObservable: Observable<any>;
    if (model.status == CommonStatusEnum.ACTIVATED) {
      message = this.lang.map.msg_confirm_deactivate_followup_configuration;
      updateObservable = model.updateStatus(CommonStatusEnum.DEACTIVATED);
    } else {
      message = this.lang.map.msg_confirm_activate_followup_configuration;
      updateObservable = model.updateStatus(CommonStatusEnum.ACTIVATED);
    }
    this.dialog.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        updateObservable.pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
            this.reload$.next(this.serviceData.caseType);
          }, () => {
            this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
            this.reload$.next(this.serviceData.caseType);
          });
      } else {
        this.reload$.next(this.serviceData.caseType);
      }
    });
  }

}
