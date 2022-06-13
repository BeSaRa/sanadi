import {Component, Input} from '@angular/core';
import {CaseModel} from "@app/models/case-model";
import {LangService} from '@app/services/lang.service';
import {CaseTypes} from "@app/enums/case-types.enum";
import {LicenseApprovalModel} from "@app/models/license-approval-model";
import {InternalProjectLicenseResult} from "@app/models/internal-project-license-result";
import {LicenseService} from "@app/services/license.service";
import {SharedService} from "@app/services/shared.service";
import {ProjectModel} from "@app/models/project-model";
import {BlobModel} from "@app/models/blob-model";
import {ProjectModelService} from "@app/services/project-model.service";
import {ShippingApproval} from '@app/models/shipping-approval';
import {CustomsExemptionRemittanceService} from '@app/services/customs-exemption-remittance.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'case-info',
  templateUrl: './case-info.component.html',
  styleUrls: ['./case-info.component.scss']
})
export class CaseInfoComponent {
  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private customsExemptionRemittanceService : CustomsExemptionRemittanceService,
              private sharedService: SharedService) {
  }

  @Input()
  model!: CaseModel<any, any>
  // this should be updated when ever you will add a new license service
  private licenseCasList: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FUNDRAISING_LICENSING,
    CaseTypes.URGENT_INTERVENTION_LICENSING,
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN
  ]

  // this should be updated when ever you will add a new document service
  private documentCasList: number[] = [
    CaseTypes.SHIPPING_APPROVAL
  ]

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
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseFullSerial || '';
  }

  get generatedLicenseId(): string {
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseId || '';
  }

  get generatedDocumentNumber(): string {
    return (this.model as ShippingApproval).exportedBookFullSerial || '';
  }

  get generatedDocumentId(): string {
    return (this.model as ShippingApproval).bookId || '';
  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateFullSerial + '' : ''
  }

  get generatedTemplateId(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateId + '' : ''
  }

  isLicenseCase(): boolean {
    return this.licenseCasList.includes(this.model.getCaseType()) && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
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
    if (!this.generatedDocumentId) {
      return;
    }
    let document = {
      documentTitle: this.generatedDocumentNumber,
      bookId: this.generatedDocumentId
    };

    this.customsExemptionRemittanceService
      .showDocumentContent(document, this.model.getCaseType())
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, document);
      });
  }

  isTemplateModelServiceAndApproved() {
    return this.model.getCaseType() === CaseTypes.EXTERNAL_PROJECT_MODELS && this.model.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE
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
