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
import {switchMap} from 'rxjs/operators';
import {UntypedFormControl} from '@angular/forms';
import {ProfileService} from '@services/profile.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';
import {LookupService} from '@services/lookup.service';
import {Lookup} from '@app/models/lookup';

@Component({
  selector: 'external-user-update-request-request',
  templateUrl: './external-user-update-request-approval.component.html',
  styleUrls: ['./external-user-update-request-approval.component.scss']
})
export class ExternalUserUpdateRequestApprovalComponent extends AdminGenericComponent<ExternalUserUpdateRequest, ExternalUserUpdateRequestService> {
  allRequests$: BehaviorSubject<ExternalUserUpdateRequest[]> = new BehaviorSubject<ExternalUserUpdateRequest[]>([]);

  constructor(public lang: LangService,
              public service: ExternalUserUpdateRequestService,
              private toast: ToastService,
              private profileService: ProfileService,
              private lookupService: LookupService,
              private employeeService: EmployeeService) {
    super();
  }

  _init() {
    this._setDefaultProfileId();
    this._setCounters();
  }

  requestStatusList: Lookup[] = this.lookupService.listByCategory.ExternalUserUpdateRequestStatus;
  requestCountMap: Map<ExternalUserUpdateRequestStatusEnum, number> = new Map<ExternalUserUpdateRequestStatusEnum, number>();
  profileIdControl: UntypedFormControl = new UntypedFormControl('');
  profiles$ = this.profileService.loadAsLookups();
  selectedFilter?: Lookup;

  displayedColumns: string[] = ['icons', 'domainName', 'arName', 'enName', 'updatedOn', 'requestStatus', 'updatedBy', 'actions'];// 'empNum', 'organization', 'status', 'statusDateModified',
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
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.updatedByInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : a.updatedByInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };
  @ViewChild('table') table!: TableComponent;

  actionIconsEnum = ActionIconsEnum;
  requestStatusClasses: Record<number, string> = {
    [ExternalUserUpdateRequestStatusEnum.APPROVED]: 'btn-success',
    [ExternalUserUpdateRequestStatusEnum.IN_PROGRESS]: 'btn-warning',
    [ExternalUserUpdateRequestStatusEnum.REJECTED]: 'btn-danger',
  };
  actions: IMenuItem<ExternalUserUpdateRequest>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.editRequest(item),
      show: () => this.service.canEditUserRequest()
    },
    // view changes
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.USER_CHANGES,
      onClick: (item) => this.viewChanges(item)
    },
    // accept
    {
      type: 'action',
      label: 'lbl_accept',
      icon: ActionIconsEnum.ACCEPT,
      onClick: (item) => this.acceptRequest(item),
      show: () => this.service.canAcceptUserRequest()
    },
    // reject
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.CANCEL,
      onClick: (item) => this.rejectRequest(item),
      show: () => this.service.canRejectUserRequest()
    }
  ];

  viewChanges(item: ExternalUserUpdateRequest): void {
    this.service.viewChangesDialog(item)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
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

  selectFilter(selectedStatus: Lookup | undefined) {
    this.selectedFilter = selectedStatus;
    this.models = this._filterRequestsByProfileAndStatus(this.selectedFilter?.lookupKey);
  }

  private _setDefaultProfileId() {
    const isSubAdmin = this.employeeService.userRolesManageUser.isSubAdmin();
    if (isSubAdmin) {
      this.profileIdControl.setValue(this.employeeService.getProfile()!.id);
      this.profileIdControl.disable();
    }
  }
}
