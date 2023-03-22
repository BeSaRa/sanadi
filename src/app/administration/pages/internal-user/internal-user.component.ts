import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {InternalUser} from '@app/models/internal-user';
import {LangService} from '@app/services/lang.service';
import {InternalUserService} from '@app/services/internal-user.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {of, Subject} from 'rxjs';
import {ToastService} from '@app/services/toast.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserPreferencesService} from '@services/user-preferences.service';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user.component.scss']
})
export class InternalUserComponent extends AdminGenericComponent<InternalUser, InternalUserService> {
  usePagination = true;
  displayedColumns: string[] = ['rowSelection', 'username', 'arName', 'enName', 'defaultDepartment', 'status', 'actions'];
  searchColumns: string[] = ['_','search_username', 'search_arName', 'search_enName','search_defaultDepartment', 'search_status', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_username: {
      key: 'username',
      controlType: 'text',
      property: 'domainName',
      label: 'lbl_username',
      maxLength: 50
    },
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }
  commonStatusEnum = CommonStatusEnum;
  view$: Subject<InternalUser> = new Subject<InternalUser>();
  actions: IMenuItem<InternalUser>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (user) => this.edit(user)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (user) => this.view$.next(user)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    },
    // user preferences
    {
      type: 'action',
      icon: 'mdi-account-edit',
      label: 'user_preferences',
      onClick: (item) => this.openUserPreferences(item)
    }
  ];

  constructor(public lang: LangService,
              private toast: ToastService,
              public service: InternalUserService,
              private userPreferencesService: UserPreferencesService,
              private lookupService:LookupService,
              private fb: FormBuilder) {
    super();
  }

  protected _init() {
    this.listenToView();
    this.buildFilterForm();
  }

  sortingCallbacks = {
    statusInfo: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    defaultDepartmentInfo: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.defaultDepartmentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.defaultDepartmentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    username: (a: InternalUser, b: InternalUser, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.domainName.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.domainName.toLowerCase();
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

  toggleStatus(model: InternalUser) {
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

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.models)))
      .subscribe(() => this.reload$.next(null));
  }

  edit(internalUser: InternalUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.service.openUpdateDialog(internalUser.id, this.models)
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((dialog: DialogRef) => {
        return dialog.onAfterClose$;
      }))
      .subscribe((_) => {
        this.reload$.next(null);
      });
  }

  openUserPreferences(item: InternalUser) {
    this.userPreferencesService.openEditDialog(item.generalUserId, false).subscribe();
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      domainName: [''], 
      arName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      status: [null],
      
    })
  }
}
