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

@Component({
  selector: 'app-subvention-log-popup',
  templateUrl: './subvention-log-popup.component.html',
  styleUrls: ['./subvention-log-popup.component.scss']
})
export class SubventionLogPopupComponent implements OnInit, OnDestroy {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['organization', 'branch', 'user', 'actionType', 'actionTime', 'comments'];
  auditDisplayColumns: string[] = ['organization', 'branch', 'user', 'operation', 'updatedOn', 'actions'];
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

  showAuditDetails($event: MouseEvent, record: SanadiAuditResult): void {
    $event?.preventDefault();
    record.showAuditDetails($event)
      .subscribe((details: SubventionAid | SubventionRequest | Beneficiary) => {
        this.dialogService.show(AuditDetailsPopupComponent, {
          record,
          details
        });
      })
  }
}
