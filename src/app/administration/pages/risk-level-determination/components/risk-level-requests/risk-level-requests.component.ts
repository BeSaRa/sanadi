import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { approvalStatusEnum } from '@app/enums/approvalStatus.enum';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { RiskLevelDeterminationRequestStatusEnum } from '@app/enums/risk-level-determination-request-status-enumts';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { Pagination } from '@app/models/pagination';
import { RiskLevelDetermination } from '@app/models/risk-level-determination';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { RiskLevelDeterminationService } from '@app/services/risk-level-determination.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommentPopupComponent } from '@app/shared/popups/comment-popup/comment-popup.component';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, takeUntil, exhaustMap, catchError, of, filter, switchMap, BehaviorSubject, take, tap } from 'rxjs';

@Component({
  selector: 'risk-level-requests',
  templateUrl: 'risk-level-requests.component.html',
  styleUrls: ['risk-level-requests.component.scss']
})
export class RiskLevelRequestsComponent extends AdminGenericComponent<RiskLevelDetermination, RiskLevelDeterminationService> {

  usePagination: boolean = true;
  lang = inject(LangService);
  service = inject(RiskLevelDeterminationService);
  fb = inject(FormBuilder);
  lookupService = inject(LookupService);
  dialogService = inject(DialogService);
  toast = inject(ToastService);
  employeeService = inject(EmployeeService);

  @Input() requestStatuses: RiskLevelDeterminationRequestStatusEnum[] = []
  @Input() title: keyof ILanguageKeys = 'lbl_requests'


  @Input() reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Output() decisionMade = new EventEmitter()
  bulkActions: IGridAction[] = [];

  constructor() {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildBulkActions();
    this.buildFilterForm();
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['rowSelection', 'requestFullSerial', 'countryId', 'applicantId', 'comment', 'requestStatus', 'actions'];
  searchColumns: string[] = [];
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

  view$: Subject<RiskLevelDetermination> = new Subject<RiskLevelDetermination>();
  actions: IMenuItem<RiskLevelDetermination>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      show: (item: RiskLevelDetermination) => this.canUpdate(item),
      onClick: (item: RiskLevelDetermination) => this.edit$.next(item)
    },
    // approve
    {
      type: 'action',
      label: 'approve',
      icon: ActionIconsEnum.APPROVE,
      show: (item) => this.canMakeDecision(item),
      onClick: (item: RiskLevelDetermination) => this.approve(item)
    },
    // reject
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.BLOCK,
      show: (item) => this.canMakeDecision(item),
      onClick: (item: RiskLevelDetermination) => this.reject(item)
    },
    // return
    {
      type: 'action',
      label: 'lbl_return',
      icon: ActionIconsEnum.REASSIGN,
      show: (item) => this.canMakeDecision(item),
      onClick: (item: RiskLevelDetermination) => this.return(item)
    },
    // acknowledge
    {
      type: 'action',
      label: 'lbl_acknowledge',
      icon: ActionIconsEnum.LAUNCH,
      show: (item: RiskLevelDetermination) => this.employeeService.isExternalUser() && !item.isAcknowledged,
      onClick: (item: RiskLevelDetermination) => this.acknowledge(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item: RiskLevelDetermination) => this.showAuditLogs(item)
    },

  ];

  sortingCallbacks = {
    status: (a: RiskLevelDetermination, b: RiskLevelDetermination, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestStatusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestStatusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  canMakeDecision(item: RiskLevelDetermination): boolean {
    return this.employeeService.isInternalUser() &&
      this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_RISK_LEVEL_DETERMINATION)
      && item.requestStatus === RiskLevelDeterminationRequestStatusEnum.PENDING;
  }
  canUpdate(item: RiskLevelDetermination): boolean {
    return this.employeeService.isInternalUser() &&
      this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_COUNTRIES)
      && ![RiskLevelDeterminationRequestStatusEnum.APPROVED, RiskLevelDeterminationRequestStatusEnum.REJECTED]
        .includes(item.requestStatus);
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
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }

  approve(item: RiskLevelDetermination) {
    this.service.approve(item.id)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_approved_success)
        }),
        tap(_ => this.reload$.next(null)),
        tap(_ => this.decisionMade.emit())

      )
      .subscribe()
  }
  reject(item: RiskLevelDetermination) {
    this.service.reject(item.id)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_reject_success)
        }),
        tap(_ => this.reload$.next(null)),
        tap(_ => this.decisionMade.emit())
      )
      .subscribe()
  }
  acknowledge(item: RiskLevelDetermination) {
    this.service.acknowledge(item.id)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_acknowledge_successfully)
        }),
        tap(_ => this.reload$.next(null)),
      )
      .subscribe()
  }
  return(item: RiskLevelDetermination) {
    this.dialogService.show(CommentPopupComponent)
      .onAfterClose$
      .pipe(
        take(1),
        filter(comment => !!comment),
        switchMap(comment => this.service.return(item.id, comment)),
        tap(_ => {
          this.toast.success(this.lang.map.msg_returned_success)
        }),
        tap(_ => this.reload$.next(null)),
        tap(_ => this.decisionMade.emit())

      ).subscribe()
  }
  acknowledgeBulk($event: MouseEvent) {
    $event.preventDefault();
    if (!this.selectedRecords.length) {
      return;
    }
    if (this.isInvalidSelection()) {
      this.toast.error(this.lang.map.all_request_status_should_be_approved);
      return;
    }

    if (this.selectedRecords.some(item => item.isAcknowledged)) {
      this.toast.error(this.lang.map.all_request_must_not_be_acknowledged);
      return;
    }
    const ids = this.selectedRecords.map(item => item.id);
    this.service.acknowledgeBulk(ids)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_acknowledge_successfully)
        }),
        tap(_ => this.reload$.next(null)),
      )
      .subscribe()
  }

  showAuditLogs(record: RiskLevelDetermination): void {
    if (!this.adminAuditLogService) {
      console.error('Kindly inject "AdminAuditLogService"');
      return;
    }
    this.service.openAuditLogsDialog(record.id)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  private buildBulkActions() {
    // noinspection JSUnusedLocalSymbols
    this.bulkActions = [
      {
        langKey: 'approve',
        icon: ActionIconsEnum.APPROVE,
        callback: ($event: MouseEvent) => {
          this.approveBulk($event);
        },
        show: (_) => this.employeeService.isInternalUser()
          &&
          this.requestStatuses.includes(RiskLevelDeterminationRequestStatusEnum.PENDING)
      },
      {
        langKey: 'lbl_reject',
        icon: ActionIconsEnum.BLOCK,
        callback: ($event: MouseEvent) => {
          this.rejectBulk($event);
        },
        show: (_) => this.employeeService.isInternalUser() &&
          this.requestStatuses.includes(RiskLevelDeterminationRequestStatusEnum.PENDING)

      },
      {
        langKey: 'lbl_acknowledge',
        icon: ActionIconsEnum.LAUNCH,
        callback: ($event: MouseEvent) => {
          this.acknowledgeBulk($event);

        },
        show: (_) => this.employeeService.isExternalUser()

      },


    ];
  }
  get selectedRecords(): RiskLevelDetermination[] {
    return this.table.selection.selected;
  }
  approveBulk($event: MouseEvent): void {
    $event.preventDefault();

    if (!this.selectedRecords.length) {
      return;
    }
    if (this.isInvalidSelection()) {
      this.toast.error(this.lang.map.all_request_status_should_be_pending);
      return;
    }
    const ids = this.selectedRecords.map(item => item.id);
    this.service.approveBulk(ids)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_approved_success)
        }),
        tap(_ => this.reload$.next(null)),
        tap(_ => this.decisionMade.emit())

      )
      .subscribe()
  }
  rejectBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (!this.selectedRecords.length) {
      return;
    }
    if (this.isInvalidSelection()) {
      this.toast.error(this.lang.map.all_request_status_should_be_approved);
      return;
    }
    const ids = this.selectedRecords.map(item => item.id);
    this.service.rejectBulk(ids)
      .pipe(
        tap(_ => {
          this.toast.success(this.lang.map.msg_reject_success)
        }),
        tap(_ => this.reload$.next(null)),
        tap(_ => this.decisionMade.emit())

      )
      .subscribe()

  }

  isInvalidSelection(): boolean {
    return this.selectedRecords.some(item => item.requestStatus !== approvalStatusEnum.Approved)
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
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
        }

        return this.service.getByStatuses(paginationOptions, this.requestStatuses)
      }))
      .subscribe((result: Pagination<RiskLevelDetermination[]>) => {

        this.models = result.rs;
        this.count = result.count;
        this.afterReload();
      })
  }
}

