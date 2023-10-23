import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { Component, Input, OnInit } from '@angular/core';
import { CaseModel } from '@app/models/case-model';
import { LangService } from '@app/services/lang.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { InternalProjectLicenseResult } from '@app/models/internal-project-license-result';
import { LicenseService } from '@app/services/license.service';
import { SharedService } from '@app/services/shared.service';
import { ProjectModel } from '@app/models/project-model';
import { BlobModel } from '@app/models/blob-model';
import { ProjectModelService } from '@app/services/project-model.service';
import { CustomsExemptionRemittance } from '@app/models/customs-exemption-remittance';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { CustomsExemptionRemittanceService } from '@services/customs-exemption-remittance.service';
import { InternalBankAccountApproval } from '@app/models/internal-bank-account-approval';
import { BankAccountRequestTypes, ServiceRequestTypes } from '@app/enums/service-request-types';
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { SubmissionMechanisms } from '@app/enums/submission-mechanisms.enum';
import { ProjectImplementation } from '@models/project-implementation';
import { EmployeeService } from '@services/employee.service';
import { AllRequestTypesEnum } from "@enums/all-request-types-enum";
import { ActionRegistry } from "@models/action-registry";
import { ServiceActionTypesEnum } from "@enums/service-action-type.enum";
import { BehaviorSubject, merge } from "rxjs";
import { delay } from "rxjs/operators";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'case-info',
  templateUrl: './case-info.component.html',
  styleUrls: ['./case-info.component.scss']
})
export class CaseInfoComponent implements OnInit {
  constructor(public lang: LangService,
    private employeeService: EmployeeService,
    private licenseService: LicenseService,
    private customsExemptionRemittanceService: CustomsExemptionRemittanceService,
    private generalAssociationMeetingAttendanceService: GeneralAssociationMeetingAttendanceService,
    private financialTransferLicensingService: FinancialTransferLicensingService,
    private sharedService: SharedService) {
  }

  private _model$: BehaviorSubject<CaseModel<any, any>> = new BehaviorSubject<CaseModel<any, any>>({} as CaseModel<any, any>);
  private _allLogs$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private wasItemReturned: boolean = false;
  canShowVersionHistory: boolean = false;

  @Input()
  set model(value: CaseModel<any, any>) {
    this._model$.next(value);
  }

  get model(): CaseModel<any, any> {
    return this._model$.value;
  }

  @Input()
  set allLogs(value: ActionRegistry[]) {
    this.setWasItemReturned(value);
    this._allLogs$.next(value);
  }

  get allLogs(): ActionRegistry[] {
    return this._allLogs$.value;
  }

  ngOnInit(): void {
    this.onRecordChange()
  }

  // this should be updated when ever you will add a new license service
  private licenseCaseList: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FUNDRAISING_LICENSING,
    CaseTypes.URGENT_INTERVENTION_LICENSING,
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN,
    CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL,
    CaseTypes.URGENT_INTERVENTION_CLOSURE,
    // CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
    CaseTypes.EMPLOYMENT,
    CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST,
    CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
    CaseTypes.AWARENESS_ACTIVITY_SUGGESTION,
    CaseTypes.PROJECT_FUNDRAISING,
    CaseTypes.FOREIGN_COUNTRIES_PROJECTS,
    CaseTypes.PROJECT_IMPLEMENTATION,
    CaseTypes.FINANCIAL_TRANSFERS_LICENSING,
    CaseTypes.ORGANIZATION_ENTITIES_SUPPORT,
    CaseTypes.PROJECT_COMPLETION
  ];

  // this should be updated when ever you will add a new document service
  private documentCaseList: number[] = [
    CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE,
    CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE
  ];

  get fullSerial(): string {
    return this.model.fullSerial || '';
  }

  get caseStatusInfo(): string {
    return this.model.caseStatusInfo?.getName() || '';
  }

  get username(): string {
    return this.model.hasDetails() ? this.model.taskDetails.fromUserInfo.getName() : (this.model.creatorInfo ? this.model.creatorInfo.getName() : '');
  }

  get generatedLicenseNumber(): string {
    if (!this.model) {
      return '';
    }
    if (this.model.getCaseType() === CaseTypes.URGENT_INTERVENTION_CLOSURE) {
      return (this.model as LicenseApprovalModel<any, any>).oldLicenseFullSerial || '';
    }
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseFullSerial || '';
  }

  get generatedLicenseId(): string {
    if (!this.model) {
      return '';
    }
    if (this.model.getCaseType() === CaseTypes.URGENT_INTERVENTION_CLOSURE) {
      return (this.model as any).licenseVSID || '';
    }
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseId || '';
  }

  get generatedDocumentNumber(): string {
    if (this.model.getCaseType() === CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE) {
      return (this.model as CustomsExemptionRemittance).exportedBookFullSerial || '';
    } else if (this.model.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
      return (this.model as GeneralAssociationMeetingAttendance).fullSerial || '';
    } else if (this.model.getCaseType() === CaseTypes.FINANCIAL_TRANSFERS_LICENSING) {
      return (this.model as FinancialTransferLicensing).exportedLicenseFullSerial || '';
    } else {
      return '';
    }
  }

  get generatedDocumentId(): string {
    if (this.model.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
      return (this.model as GeneralAssociationMeetingAttendance).meetingReportID;
    } else if (this.model.getCaseType() === CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE) {
      return (this.model as CustomsExemptionRemittance).bookId;
    } else if (this.model.getCaseType() === CaseTypes.FINANCIAL_TRANSFERS_LICENSING) {
      return (this.model as FinancialTransferLicensing).exportedLicenseId;
    } else {
      return '';
    }

  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateFullSerial + '' : '';
  }

  get generatedTemplateId(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateId + '' : '';
  }

  isLicenseCase(): boolean {
    if (!this.licenseCaseList.includes(this.model.getCaseType())) {
      return false;
    }
    const caseStatus = this.model.getCaseStatus();
    if (this.model.caseType === CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL) {
      return caseStatus === CommonCaseStatus.FINAL_APPROVE && (this.model as InternalBankAccountApproval).requestType !== BankAccountRequestTypes.CANCEL;
    } else if (this.model.caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
      if (caseStatus === CommonCaseStatus.FINAL_REJECTION) {
        return ((this.model as ProjectImplementation).requestType === ServiceRequestTypes.NEW && this.model.submissionMechanism === SubmissionMechanisms.REGISTRATION);
      }
      return (caseStatus === CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.UNDER_EXAMINATION);
    } else if (this.model.caseType === CaseTypes.AWARENESS_ACTIVITY_SUGGESTION || this.model.caseType === CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) {
      return caseStatus === CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION;
    } else if (this.model.caseType === CaseTypes.FINANCIAL_TRANSFERS_LICENSING && this.model.submissionMechanism === SubmissionMechanisms.NOTIFICATION) {
      return caseStatus >= CommonCaseStatus.UNDER_PROCESSING;
    } else {
      return caseStatus === CommonCaseStatus.FINAL_APPROVE;
    }
  }

  isDocumentCase(): boolean {
    return this.documentCaseList.includes(this.model.getCaseType()) &&
    this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE && (this.model.getCaseType() !== CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE || this.employeeService.isInternalUser());
  }

  isGeneralAssociationMeetingAttendanceInitApproveCase() {
    return this.model.getCaseType() == CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE && this.model.getCaseStatus() === CommonCaseStatus.INITIAL_APPROVE;
  }
  isGeneralAssociationMeetingAttendanceFinalReport() {
    return this.model.getCaseType() == CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE && this.employeeService.isInternalUser();
  }

  viewGeneralAssociationMeetingAttendanceInitApproveDocument(): void {
    (this.generalAssociationMeetingAttendanceService)
      .generateInitDocument(this.model.getCaseId())
      .subscribe((blob) => window.open(blob.url));
  }

  viewGeneralAssociationMeetingAttendanceFinalReport(): void {
    (this.generalAssociationMeetingAttendanceService)
      .downloadFinalReport((this.model as GeneralAssociationMeetingAttendance).meetingReportID)
      .subscribe((blob) => window.open(blob.url));
  }

  viewGeneratedLicense(): void {
    if (!this.generatedLicenseId) {
      return;
    }
    let license = {
      documentTitle: this.generatedLicenseNumber,
      id: this.generatedLicenseId
    } as InternalProjectLicenseResult;
    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  viewGeneratedDocument(): void {
    if (!this.generatedDocumentId) {
      return;
    }
    let document = {
      documentTitle: this.generatedDocumentNumber,
      bookId: this.generatedDocumentId
    };

    if (this.model.getCaseType() === CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE) {
      this.customsExemptionRemittanceService
        .showDocumentContent(document, this.model.getCaseType())
        .subscribe((file) => {
          return this.sharedService.openViewContentDialog(file, document);
        });
    }

    if (this.model.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
      (this.generalAssociationMeetingAttendanceService)
        .downloadFinalReport(this.generatedDocumentId)
        .subscribe((file) => {
          return this.sharedService.openViewContentDialog(file, document);
        });
    }
  }

  isTemplateModelServiceAndApproved() {
    return this.model.getCaseType() === CaseTypes.EXTERNAL_PROJECT_MODELS && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
  }

  viewProjectModelTemplate(): void {
    if (!this.templateSerial) {
      return;
    }
    (this.model.service as ProjectModelService).exportTemplate(this.generatedTemplateId)
      .subscribe((file: BlobModel) => {
        this.sharedService.openViewContentDialog(file, { documentTitle: this.templateSerial });
      });
  }

  private setWasItemReturned(allLogs: ActionRegistry[]) {
    if (!allLogs || allLogs.length === 0) {
      this.wasItemReturned = false;
    }
    return this.wasItemReturned = allLogs.some((log: ActionRegistry) => log.actionId === ServiceActionTypesEnum.RETURN_TO_ORGANIZATION);
  }

  private _setShowVersionHistory(): void {
    if (this.employeeService.isExternalUser()) {
      return;
    }

    if (this.model.getCaseType() === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      this.canShowVersionHistory = true;
      return;
    }

    // @ts-ignore
    const requestType = this.model.requestType;
    if (!requestType) {
      return;
    }

    if (
      ([AllRequestTypesEnum.RENEW, AllRequestTypesEnum.CANCEL, AllRequestTypesEnum.UPDATE].includes(requestType))
      || (requestType === AllRequestTypesEnum.NEW && this.wasItemReturned)
    ) {
      this.canShowVersionHistory = true;
      return;
    }
  }

  private onRecordChange() {
    merge(this._model$, this._allLogs$).pipe(delay(100)).subscribe((value) => {
      if (!this.model || !this.allLogs.length) {
        return;
      }
      this._setShowVersionHistory();
    })
  }
}
