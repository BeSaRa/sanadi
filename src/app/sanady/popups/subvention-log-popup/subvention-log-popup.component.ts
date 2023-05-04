import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {SubventionLog} from '@app/models/subvention-log';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {printBlobData, searchInObject} from '@app/helpers/utils';
import {forkJoin, Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SubventionLogService} from '@app/services/subvention-log.service';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {SubventionAidService} from '@app/services/subvention-aid.service';
import {BeneficiaryService} from '@app/services/beneficiary.service';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {SubventionAid} from '@app/models/subvention-aid';
import {SubventionRequest} from '@app/models/subvention-request';
import {Beneficiary} from '@app/models/beneficiary';
import {DialogService} from '@app/services/dialog.service';
import {AuditDetailsPopupComponent} from '@app/sanady/popups/audit-details-popup/audit-details-popup.component';
import {UntypedFormControl} from '@angular/forms';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'app-subvention-log-popup',
  templateUrl: './subvention-log-popup.component.html',
  styleUrls: ['./subvention-log-popup.component.scss']
})
export class SubventionLogPopupComponent implements OnInit, OnDestroy {

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<SubventionLog[]>,
              public langService: LangService,
              private dialogService: DialogService,
              private subventionLogService: SubventionLogService,
              private subventionRequestService: SubventionRequestService,
              private subventionAidService: SubventionAidService,
              private beneficiaryService: BeneficiaryService,
  ) {
    this.logList = data.logList;
    this.logListClone = data.logList;
    this.requestId = data.requestId;
  }

  ngOnInit(): void {
    this.listenToSearch();
    this.listenToInternalSearch();
    this.loadAuditData();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  userClick: typeof UserClickOn = UserClickOn;
  generalDisplayedColumns: string[] = ['organization', 'user', 'actionType', 'actionTime', 'userComments'];
  auditDisplayedColumns: string[] = ['organization', 'user', 'actionType', 'actionTime', 'actions'];
  search$: Subject<string> = new Subject<string>();
  internalSearch$: Subject<string> = new Subject<string>();
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;
  logList: SubventionLog[];
  logListClone: SubventionLog[] = [];
  requestId: number;

  auditBeneficiaryData: SanadiAuditResult[] = [];
  auditSubventionRequestData: SanadiAuditResult[] = [];
  auditSubventionAidData: SanadiAuditResult[] = [];

  headerColumn: string[] = ['extra-header'];
  generalFilterControl: UntypedFormControl = new UntypedFormControl('');
  auditFilterControl: UntypedFormControl = new UntypedFormControl('');

  generalSortingCallbacks = {
    organization: (a: SubventionLog, b: SubventionLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    user: (a: SubventionLog, b: SubventionLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionType: (a: SubventionLog, b: SubventionLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.actionTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.actionTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionTime: (a: SubventionLog, b: SubventionLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.actionTime),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.actionTime);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  auditSortingCallbacks = {
    organization: (a: SanadiAuditResult, b: SanadiAuditResult, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    user: (a: SanadiAuditResult, b: SanadiAuditResult, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.userInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.userInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionType: (a: SanadiAuditResult, b: SanadiAuditResult, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.operationInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.operationInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionTime: (a: SanadiAuditResult, b: SanadiAuditResult, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.updatedOn),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.updatedOn);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  auditActions: IMenuItem<SanadiAuditResult>[] = [
    // show details
    {
      type: 'action',
      label: 'show_details',
      icon: ActionIconsEnum.DETAILS,
      onClick: (item: SanadiAuditResult) => this.showAuditDetails(item)
    }
  ];

  tabsData: IKeyValue = {
    general: {
      name: 'generalTab',
      langKey: 'lbl_general'
    },
    audit: {
      name: 'auditTab',
      langKey: 'lbl_audit'
    },
    auditBeneficiary: {
      name: 'auditBeneficiaryTab',
      langKey: 'lbl_audit'
    },
    auditRequest: {
      name: 'auditRequestTab',
      langKey: 'lbl_audit'
    },
    auditAid: {
      name: 'auditAidTab',
      langKey: 'lbl_audit'
    },
  }


  search(searchText: string): void {
    this.search$.next(searchText);
  }

  printLogs(): void {
    this.subventionLogService.loadByRequestIdAsBlob(this.requestId)
      .subscribe((data) => {
        printBlobData(data, 'RequestLogs.pdf');
      });
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.logList = this.logListClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.logList = this.logListClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private loadAuditData(): void {
    forkJoin({
      beneficiaryAudit: this.beneficiaryService.loadBeneficiaryAuditData(this.requestId),
      subventionRequestAudit: this.subventionRequestService.loadSubventionRequestAuditData(this.requestId),
      subventionAidAudit: this.subventionAidService.loadSubventionAidAuditData(this.requestId)
    }).subscribe(result => {
      this.auditBeneficiaryData = result.beneficiaryAudit;
      this.auditSubventionRequestData = result.subventionRequestAudit;
      this.auditSubventionAidData = result.subventionAidAudit;
    })
  }

  showAuditDetails(record: SanadiAuditResult, $event?: MouseEvent): void {
    $event?.preventDefault();
    record.showAuditDetails()
      .subscribe((details: SubventionAid | SubventionRequest | Beneficiary) => {
        if (!details) {
          this.dialogService.info(this.langService.map.no_records_to_display);
          return;
        }
        this.dialogService.show(AuditDetailsPopupComponent, {
          record,
          details
        });
      })
  }
}
