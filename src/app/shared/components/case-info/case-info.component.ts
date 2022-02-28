import {Component, Input, OnInit} from '@angular/core';
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

@Component({
  selector: 'case-info',
  templateUrl: './case-info.component.html',
  styleUrls: ['./case-info.component.scss']
})
export class CaseInfoComponent implements OnInit {
  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private sharedService: SharedService) {
  }

  @Input()
  model!: CaseModel<any, any>
  caseStatusEnum: any;
  // this should be updated when ever you will add a new license service
  private licenseCasList: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
  ]


  ngOnInit(): void {
    this.caseStatusEnum = this.model.service.caseStatusEnumMap[this.model.getCaseType()];
  }

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
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseFullserial || '';
  }

  get generatedLicenseId(): string {
    return (this.model as LicenseApprovalModel<any, any>).exportedLicenseId || '';
  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateFullSerial + '' : ''
  }

  get generatedTemplateId(): string {
    return this.isTemplateModelServiceAndApproved() ? (this.model as ProjectModel).templateId + '' : ''
  }

  isLicenseCase(): boolean {
    return this.licenseCasList.includes(this.model.getCaseType()) && this.caseStatusEnum && this.model.getCaseStatus() === this.caseStatusEnum.FINAL_APPROVE;
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

  isTemplateModelServiceAndApproved() {
    return this.model.getCaseType() === CaseTypes.EXTERNAL_PROJECT_MODELS && this.model.getCaseStatus() === this.caseStatusEnum.FINAL_APPROVE
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
