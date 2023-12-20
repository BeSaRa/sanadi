import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { filter, switchMap, tap, takeUntil, map, exhaustMap, catchError } from 'rxjs/operators';
import { CollectedFundsService } from '@app/services/collected-funds.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { CustomValidators } from '@app/validators/custom-validators';
import { ProjectFundraisingService } from '@app/services/project-fundraising.service';
import { ProjectFundraising } from '@app/models/project-fundraising';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { LicenseService } from '@app/services/license.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { FundSummary } from '@app/models/fund-summary';
import { FundUnit } from '@app/models/fund-unit';
import { AddFundUnitPopupComponent } from '../../popups/add-fund-unit-popup/add-fund-unit-popup.component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { EmployeeService } from '@app/services/employee.service';
import { approvalStatusEnum } from '@app/enums/approvalStatus.enum';

@Component({
  selector: 'app-collected-funds',
  templateUrl: './collected-funds.component.html',
  styleUrls: ['./collected-funds.component.scss']
})
export class CollectedFundsComponent implements OnInit, OnDestroy {
  usePagination = true;
  licenseSearch$: Subject<void> = new Subject<void>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<void> = new Subject();
  approve$: Subject<FundUnit> = new Subject();
  reject$: Subject<FundUnit> = new Subject();
  refund$: Subject<FundUnit> = new Subject();
  destroy$: Subject<void> = new Subject();
  licenseSearchControl: UntypedFormControl = new FormControl('', [CustomValidators.required]);
  fileIconsEnum = FileIconsEnum;
  summary!: FundSummary;
  models: FundUnit[] = [];
  displayedColumns: string[] = ['permitType', 'projectTotalCost', 'collectedAmount', 'totalCost', 'approvalStatus', 'actions'];
  constructor(public lang: LangService,
    public service: CollectedFundsService,
    private dialogService: DialogService,
    private projectFundraisingService: ProjectFundraisingService,
    private licenseService: LicenseService,
    public employeeService: EmployeeService,
    private toast: ToastService) {
  }
  ngOnInit(): void {
    this._listenToReload();
    this._listenToLicenseSearch();
    this._listenToAdd();
    this._listenToApproveFund();
    this._listenToRefund();
    this._listenToRejectFund();
  }

  @ViewChild('table') table!: TableComponent;
  approvalStatus = approvalStatusEnum;
  actions: IMenuItem<any>[] = [
    {
      type: 'action',
      label: 'approve',
      icon: ActionIconsEnum.USER_CHECK,
      show: (item: FundUnit) => item.approvalStatus == approvalStatusEnum.Pending && this.employeeService.isCharityManager(),
      onClick: (item: FundUnit) => this.approve$.next(item)
    },
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.USER_CANCEL,
      show: (item: FundUnit) => item.approvalStatus == approvalStatusEnum.Pending && this.employeeService.isCharityManager(),
      onClick: (item: FundUnit) => this.reject$.next(item)
    },
    {
      type: 'action',
      label: 'lbl_refund',
      icon: 'mdi-cash-refund',
      show: (item: FundUnit) => this.employeeService.isExternalUser() && item.approvalStatus != approvalStatusEnum.Pending && item.approvalStatus != approvalStatusEnum.Approved && !this.isRefundRow(item),
      onClick: (item: FundUnit) => this.refund$.next(item)
    },
  ];
  private _listenToApproveFund() {
    this.approve$
      .pipe(switchMap((item: FundUnit) => {
        return this.service.approveFund(item)
      }))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_fund_added_success);
        this.reload$.next(null);
      });
  }
  private _listenToRefund() {
    this.refund$
      .pipe(switchMap((item: FundUnit) => {
        return this.dialogService.confirm(this.lang.map.msg_confirm_refund_selected)
          .onAfterClose$.pipe(
            filter((click: UserClickOn) => click === UserClickOn.YES),
            map(_ => item)
          )
      }))
      .pipe(switchMap((item: FundUnit) => {
        return this.service.reFundItem(item);
      }))
      .subscribe(() => {
        if(this.employeeService.isCharityManager()) {
          this.toast.success(this.lang.map.msg_refunded_success);
        } else {
          this.toast.success(this.lang.map.msg_refund_request_added);
        }
        this.reload$.next(null);
      });
  }
  private _listenToRejectFund() {
    this.reject$
      .pipe(switchMap((item: FundUnit) => {
        return this.dialogService.confirm(this.lang.map.msg_confirm_reject_selected)
          .onAfterClose$.pipe(
            filter((click: UserClickOn) => click === UserClickOn.YES),
            map(_ => item)
          )
      }))
      .pipe(switchMap((item: FundUnit) => {
        return this.service.rejectFund(item);
      }))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_reject_success);
        this.reload$.next(null);
      });
  }

  
  licenseSearch($event?: Event) {
    $event?.preventDefault();
    this.licenseSearch$.next()
  }
  private _listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(_ => this.licenseSearchControl.valid))
      .pipe(
        switchMap(_ => {
          return this.projectFundraisingService.licenseSearch({
            fullSerial: this.licenseSearchControl.value
          })
        })
      ).pipe(
        tap((list) => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        filter((result) => !!result.length)
      )
      .pipe(exhaustMap(licenses => licenses.length === 1 ? of(licenses[0]) : this.openSelectLicense(licenses)))
      .pipe(filter((info): info is ProjectFundraising => !!info))
      .pipe(
        exhaustMap((license: ProjectFundraising) => {
          return this.service.loadFundsSummaryByVsId(license.vsId)
        })
      )
      .subscribe((summary: FundSummary) => {
        this.summary = summary;
        this.licenseSearchControl.setValue(summary.fullSerial);
        this.reload$.next(null);
      });
  }
  private _listenToReload() {
    this.reload$
      .pipe(filter(_ => this.summary && !!this.summary.fundraisingVsId))
      .pipe(switchMap(() => {
        return this.service.loadFundsByVsId(this.summary.fundraisingVsId).pipe(map(_ => _.rs))
      }))
      .subscribe((units: FundUnit[]) => {
        this.models = units;
      });
  }
  private _listenToAdd() {
    this.add$
      .pipe(filter(_ => this.summary && !!this.summary.fundraisingVsId))
      .pipe(switchMap(() => {
        return this.dialogService.show(AddFundUnitPopupComponent, {
          vsId: this.summary.fundraisingVsId,
          projectTotalCost: this.summary.targetAmount,
          permitType: this.summary.permitType,
        }).onAfterClose$
      }))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }
  private openSelectLicense(licenses: ProjectFundraising[]): Observable<undefined | ProjectFundraising> {
    return this.licenseService.openSelectLicenseDialog(licenses, new ProjectFundraising().clone({ caseType: CaseTypes.PROJECT_FUNDRAISING }), true, this.projectFundraisingService.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: ProjectFundraising, details: ProjectFundraising } | undefined)) => result ? result.details : result));
  }
  isRefundRow(row: FundUnit) {
    return row.collectedAmount < 0
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
