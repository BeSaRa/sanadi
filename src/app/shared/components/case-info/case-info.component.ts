import {Component, Input} from '@angular/core';
import {CaseModel} from '@app/models/case-model';
import {LangService} from '@app/services/lang.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {LicenseService} from '@app/services/license.service';
import {SharedService} from '@app/services/shared.service';
import {ProjectModel} from '@app/models/project-model';
import {BlobModel} from '@app/models/blob-model';
import {ProjectModelService} from '@app/services/project-model.service';
import {CustomsExemptionRemittance} from '@app/models/customs-exemption-remittance';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {CustomsExemptionRemittanceService} from '@services/customs-exemption-remittance.service';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {BankAccountRequestTypes} from '@app/enums/bank-account-request-types';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'case-info',
  templateUrl: './case-info.component.html',
  styleUrls: ['./case-info.component.scss']
})
export class CaseInfoComponent {
  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private customsExemptionRemittanceService: CustomsExemptionRemittanceService,
              private sharedService: SharedService) {
  }

  @Input()
  model!: CaseModel<any, any>;
  // this should be updated when ever you will add a new license service
  private licenseCasList: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FUNDRAISING_LICENSING,
    CaseTypes.URGENT_INTERVENTION_LICENSING,
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN,
    CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL,
    CaseTypes.URGENT_INTERVENTION_CLOSURE,
    CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
    CaseTypes.EMPLOYMENT,
    CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST,
    CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
    CaseTypes.AWARENESS_ACTIVITY_SUGGESTION
  ];

  // this should be updated when ever you will add a new document service
  private documentCasList: number[] = [
    CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE
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
    return (this.model as CustomsExemptionRemittance).exportedBookFullSerial || '';
  }

  get generatedDocumentId(): string {
    return (this.model as CustomsExemptionRemittance).bookId || '';
  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateFullSerial + '' : '';
  }

  get generatedTemplateId(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateId + '' : '';
  }

  isLicenseCase(): boolean {
    if(this.model.caseType === CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL) {
      return this.licenseCasList.includes(this.model.getCaseType()) && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE && (this.model as InternalBankAccountApproval).requestType !== BankAccountRequestTypes.CANCEL;
    } else {
      return this.licenseCasList.includes(this.model.getCaseType()) && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
    }
  }

  isDocumentCase(): boolean {
    return this.documentCasList.includes(this.model.getCaseType()) && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
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
    console.log(this.generatedDocumentId)
    if (!this.generatedDocumentId) {
      return;
    }
    let document = {
      documentTitle: this.generatedDocumentNumber,
      bookId: this.generatedDocumentId
    };
    console.log(document)

    this.customsExemptionRemittanceService
      .showDocumentContent(document, this.model.getCaseType())
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, document);
      });
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
        this.sharedService.openViewContentDialog(file, {documentTitle: this.templateSerial});
      });
  }
}
