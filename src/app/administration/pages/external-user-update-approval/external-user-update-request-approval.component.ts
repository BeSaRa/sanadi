import {DialogService} from '@services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {IGridAction} from '@contracts/i-grid-action';
import {ExternalUserService} from '@services/external-user.service';
import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {CommonUtils} from '@app/helpers/common-utils';
import {SortEvent} from '@contracts/sort-event';
import {DateUtils} from '@helpers/date-utils';
import {BehaviorSubject} from 'rxjs';
import {exhaustMap, switchMap, takeUntil} from 'rxjs/operators';
import {FormBuilder, UntypedFormControl} from '@angular/forms';
import {ProfileService} from '@services/profile.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';
import {LookupService} from '@services/lookup.service';
import {Lookup} from '@app/models/lookup';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'external-user-update-request-request',
  templateUrl: './external-user-update-request-approval.component.html',
  styleUrls: ['./external-user-update-request-approval.component.scss']
})
export class ExternalUserUpdateRequestApprovalComponent extends AdminGenericComponent<ExternalUserUpdateRequest, ExternalUserUpdateRequestService> {
  allRequests$: BehaviorSubject<ExternalUserUpdateRequest[]> = new BehaviorSubject<ExternalUserUpdateRequest[]>([]);
  @ViewChild('table') table!: TableComponent;

  constructor(public lang: LangService,
              public service: ExternalUserUpdateRequestService,
              public externalUserService: ExternalUserService,
              private toast: ToastService,
              private dialogService: DialogService,
              private profileService: ProfileService,
              private lookupService: LookupService,
              private employeeService: EmployeeService,
              private fb: FormBuilder) {
    super();
  }

  _init() {
    this._setDefaultProfileId();
    this._setCounters();
    this.buildFilterForm();
  }

  requestStatusList: Lookup[] = this.lookupService.listByCategory.ExternalUserUpdateRequestStatus;
  externalUserUpdateRequestStatusEnum = ExternalUserUpdateRequestStatusEnum;
  requestCountMap: Map<ExternalUserUpdateRequestStatusEnum, number> = new Map<ExternalUserUpdateRequestStatusEnum, number>();
  profileIdControl: UntypedFormControl = new UntypedFormControl('');
  profiles$ = this.profileService.loadAsLookups();
  selectedFilter?: Lookup;

  get displayedColumns(): string[] {
    if (!this.service.userRolesManageUser.isApprovalAdmin()) {
      return ['domainName', 'arName', 'enName', 'requestType', 'updatedOn', 'requestStatus', 'updatedBy', 'actions'];// 'empNum', 'organization', 'status', 'statusDateModified',
    } else {
      return ['rowSelection', 'domainName', 'arName', 'enName', 'requestType', 'updatedOn', 'requestStatus', 'updatedBy', 'actions'];// 'empNum', 'organization', 'status', 'statusDateModified',
    }
  }

  searchColumns: string[] = !this.service.userRolesManageUser.isApprovalAdmin()? 
      ['search_domainName', 'search_arName', 'search_enName','search_requestType', 'search_updatedOn', 'search_requestStatus', 'search_updatedBy', 'search_actions']:
      ['_', 'search_domainName', 'search_arName', 'search_enName','search_requestType', 'search_updatedOn', 'search_requestStatus', 'search_updatedBy', 'search_actions'];

  searchColumnsConfig: SearchColumnConfigMap = {
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
    search_requestType:{
      key:'requestType',
      controlType:'select',
      property:'requestType',
      label:'request_type',
      selectOptions:{
        options: this.lookupService.listByCategory.AllRequestTypes,
        labelProperty:'getName',
        optionValueKey:'lookupKey'
      }
    },
    search_requestStatus:{
      key: 'requestStatus',
      controlType: 'select',
      property: 'requestStatus',
      label: 'request_status',
      selectOptions:{
        options: this.lookupService.listByCategory.ExternalUserUpdateRequestStatus,
        labelProperty:'getName',
        optionValueKey:'lookupKey'
      }
    }
  }
  
  sortingCallbacks = {
    updatedOn: (a: ExternalUserUpdateRequest, b: ExternalUserUpdateRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.updatedOn!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.updatedOn!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestStatus: (a: ExternalUserUpdateRequest, b: ExternalUserUpdateRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestStatusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : a.requestStatusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    updatedBy: (a: ExternalUserUpdateRequest, b: ExternalUserUpdateRequest, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.updateByInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : a.updateByInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  actionIconsEnum = ActionIconsEnum;
  requestStatusClasses: Record<number, string> = {
    [ExternalUserUpdateRequestStatusEnum.APPROVED]: 'btn-success',
    [ExternalUserUpdateRequestStatusEnum.IN_PROGRESS]: 'btn-warning',
    [ExternalUserUpdateRequestStatusEnum.REJECTED]: 'btn-danger',
  };
  actions: IMenuItem<ExternalUserUpdateRequest>[] = [
    // view changes
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.USER_CHANGES,
      onClick: (item) => this.viewChanges(item)
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.editRequest(item),
      show: (item) => this.service.canEditUserRequest() && !item.isApproved()
    },
    // accept
    {
      type: 'action',
      label: 'lbl_accept',
      icon: ActionIconsEnum.ACCEPT,
      onClick: (item) => this.acceptRequest(item),
      show: (item) => this.service.canAcceptUserRequest() && item.isInProgress()
    },
    // reject
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.CANCEL,
      onClick: (item) => this.rejectRequest(item),
      show: (item) => this.service.canRejectUserRequest() && item.isInProgress()
    }
  ];

  bulkActionsList: IGridAction[] = [
    {
      langKey: 'lbl_accept',
      icon: ActionIconsEnum.ACCEPT,
      callback: ($event: MouseEvent) => {
        this.acceptBulkRequest($event);
      }
    },
    {
      langKey: 'lbl_reject',
      icon: ActionIconsEnum.CANCEL,
      callback: ($event: MouseEvent) => {
        this.rejectBulkRequest($event);
      }
    },
  ];

  get selectedRecords(): ExternalUserUpdateRequest[] {
    return this.table.selection.selected;
  }

  viewChanges(item: ExternalUserUpdateRequest): void {
    this.service.viewChangesDialog(item)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }

  allSelected() {
    return this.table.selection.selected.length === this.table.dataSource.data.filter(d => d.requestStatus == ExternalUserUpdateRequestStatusEnum.IN_PROGRESS).length;
  }

  toggleAllInProgess(): void {
    const allSelected = this.allSelected();
    if (allSelected) {
      this.table.clearSelection();
    } else {
      this.table.dataSource.data.forEach((item: ExternalUserUpdateRequest) => item.requestStatus == ExternalUserUpdateRequestStatusEnum.IN_PROGRESS && this.table.selection.select(item));
    }
  }

  acceptRequest(item: ExternalUserUpdateRequest): void {
    this.service.acceptRequest(item)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_accept_x_success.change({x: item.getName()}));
        this.reload$.next(null);
      });
  }

  acceptBulkRequest($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.lang.map.msg_confirm_accept_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const models = this.selectedRecords.map((item) => {
            return new ExternalUserUpdateRequest().clone({
              ...item,
              requestStatus: ExternalUserUpdateRequestStatusEnum.APPROVED
            });
          });
          const sub = this.service.updateBulk(models).subscribe(() => {
            this.toast.success(this.lang.map.msg_update_success);
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
    }
  }

  rejectRequest(item: ExternalUserUpdateRequest): void {
    this.service.rejectRequestWithReason(item)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_reject_x_success.change({x: item.getName()}));
        this.reload$.next(null);
      });
  }

  rejectBulkRequest($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.service.rejectBulkRequestWithReason(this.selectedRecords)
        .subscribe((result) => {
          if (!result) {
            return;
          }
          this.toast.success(this.lang.map.msg_update_success);
          this.reload$.next(null);
        });
    }
  }

  editRequest(item: ExternalUserUpdateRequest): void {
    this.service.openUpdateRequestDialog(item)
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.reload$.next(null);
      });
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
    this.allRequests$.next(this.models);
    this.selectFilter(this.selectedFilter);
    this._setCounters();
  }

  private _filterRequestsByProfileAndStatus(status: ExternalUserUpdateRequestStatusEnum | undefined) {
    const selectedProfileId = this.profileIdControl.value;
    return this.allRequests$.value.filter(item => {
      return (CommonUtils.isValidValue(selectedProfileId) ? item.profileId === selectedProfileId : true)
        && (CommonUtils.isValidValue(status) ? item.requestStatus === status : true);
    }) ?? [];
  }

  private _setCounters(): void {
    this.requestCountMap.set(ExternalUserUpdateRequestStatusEnum.APPROVED, this._filterRequestsByProfileAndStatus(ExternalUserUpdateRequestStatusEnum.APPROVED).length);
    this.requestCountMap.set(ExternalUserUpdateRequestStatusEnum.IN_PROGRESS, this._filterRequestsByProfileAndStatus(ExternalUserUpdateRequestStatusEnum.IN_PROGRESS).length);
    this.requestCountMap.set(ExternalUserUpdateRequestStatusEnum.REJECTED, this._filterRequestsByProfileAndStatus(ExternalUserUpdateRequestStatusEnum.REJECTED).length);
  }

  handleProfileChange() {
    this.models = this._filterRequestsByProfileAndStatus(this.selectedFilter?.lookupKey);
    this._setCounters();
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.externalUserService.addDialog(this.profileIdControl.getRawValue())
          .pipe(switchMap(ref => ref.onAfterClose$));
      }))
      .subscribe(() => this.reload$.next(null));
  }

  selectFilter(selectedStatus: Lookup | undefined) {
    this.selectedFilter = selectedStatus;
    this.models = this._filterRequestsByProfileAndStatus(this.selectedFilter?.lookupKey);
  }

  private _setDefaultProfileId() {
    const isSubAdmin = this.employeeService.userRolesManageUser.isSubAdmin();
    const isApprovalAdmin = this.employeeService.userRolesManageUser.isApprovalAdmin();
    if (isSubAdmin || isApprovalAdmin) {
      this.profileIdControl.setValue(this.employeeService.getProfile()!.id);
      this.profileIdControl.disable();
    }
  }
  
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], requestType:[null], requestStatus:[null]
    })
  }
}
