import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {Component, ViewChild} from '@angular/core';
import {ExternalUser} from '@app/models/external-user';
import {ExternalUserService} from '@services/external-user.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {EmployeeService} from '@app/services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TableComponent} from '@app/shared/components/table/table.component';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {of, Subject} from 'rxjs';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {ProfileService} from '@services/profile.service';
import {FormBuilder, UntypedFormControl} from '@angular/forms';
import {PaginatorComponent} from '@app/shared/components/paginator/paginator.component';
import {UserPreferencesService} from '@services/user-preferences.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {LookupService} from '@app/services/lookup.service';
import {SearchColumnConfigMap} from '@app/interfaces/i-search-column-config';

@Component({
  selector: 'app-external-user',
  templateUrl: './external-user.component.html',
  styleUrls: ['./external-user.component.scss']
})
export class ExternalUserComponent extends AdminGenericComponent<ExternalUser, ExternalUserService> {
  view$: Subject<ExternalUser> = new Subject<ExternalUser>();
  usePagination = true;
  profileIdControl: UntypedFormControl = new UntypedFormControl('');
  profiles$ = this.profileService.loadAsLookups();
  @ViewChild('paginator') paginator!: PaginatorComponent;

  constructor(public service: ExternalUserService,
              public langService: LangService,
              private toast: ToastService,
              public configService: ConfigurationService,
              public empService: EmployeeService,
              private profileService: ProfileService,
              public externalUserUpdateRequestService: ExternalUserUpdateRequestService,
              private userPreferencesService: UserPreferencesService,
              private lookupService:LookupService,
              private fb: FormBuilder) {
    super();
  }

  _init() {
    this._setDefaultProfileId();
    this.listenToView();
    this.buildFilterForm();
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['domainName', 'arName', 'enName', 'empNum', 'organization', 'status', 'statusDateModified', 'actions'];
  searchColumns: string[] = ['search_domainName', 'search_arName', 'search_enName','search_empNum', 'search_organization', 'search_status','search_statusDateModified', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_domainName: {
      key: 'domainName',
      controlType: 'text',
      property: 'domainName',
      label: 'login_name'
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
    search_empNum: {
      key:'empNum',
      controlType:'text',
      property:'empNum',
      label:'lbl_employee_number',
      maxLength: CustomValidators.defaultLengths.NUMBERS_MAXLENGTH,
      mask: CustomValidators.inputMaskPatterns.NUMBER_ONLY
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
  bulkActionsList: IGridAction[] = [];

  actions: IMenuItem<ExternalUser>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: item => this.edit$.next(item),
      show: () => this.externalUserUpdateRequestService.canEditUser()
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
    // user preferences
    {
      type: 'action',
      icon: 'mdi-account-edit',
      label: 'user_preferences',
      onClick: (item) => this.openUserPreferences(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: ExternalUser) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== this.commonStatusEnum.RETIRED && item.status === this.commonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: ExternalUser) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== this.commonStatusEnum.RETIRED && item.status === this.commonStatusEnum.ACTIVATED;
      }
    }
  ];

  toggleStatus(item: ExternalUser) {
    this.service.updateStatus(item.id, item.status!)
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: item.getName()}));
        this.reload$.next(null);
      }, () => {
        this.reload$.next(null);
      });
  }
  get selectedRecords(): ExternalUser[] {
    return this.table.selection.selected;
  }

  private _setDefaultProfileId() {
    const isSubAdmin = this.empService.userRolesManageUser.isSubAdmin();
    if (isSubAdmin) {
      this.profileIdControl.setValue(this.empService.getProfile()!.id);
      this.profileIdControl.disable();
    }
    this.filterUsersByProfile();
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.service.addDialog(this.profileIdControl.getRawValue())
          .pipe(switchMap(ref => ref.onAfterClose$));
      }))
      .subscribe(() => this.reload$.next(null));
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.viewDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe();
  }

  filterUsersByProfile(userInteraction: boolean = false) {
    this.reload$.next(null);
  }

  listenToReload() {
    this.reload$
      .pipe(
        takeUntil(this.destroy$),
        filter(val => val !== 'init'),
      )
      .pipe(
        filter(() => {
          if (this.columnFilterFormHasValue()) {
            this.columnFilter$.next('filter');
            return false;
          }
          return true;
        })
      )
      .pipe(switchMap(() => {
        const paginationOptions = {
          limit: this.pageEvent.pageSize,
          offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
        };

        return this.service.loadByProfilePaging(paginationOptions, this.profileIdControl.getRawValue())
          .pipe(
            map((res) => {
              this.count = res.count;
              return res.rs;
            }));
      }))
      .subscribe((list: ExternalUser[]) => {
        this.models = list;
        this.afterReload();
      });
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  openUserPreferences(item: ExternalUser) {
    this.userPreferencesService.openEditDialog(item, false).subscribe();
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], empNum: [null], status: [null], domainName: ['']
    })
  }

  getColumnFilterValue(): Partial<ExternalUser> {
    const value: Partial<ExternalUser> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.profileId = this.profileIdControl.value ?? null;
      return value;
    }
    return {};
  }
}
