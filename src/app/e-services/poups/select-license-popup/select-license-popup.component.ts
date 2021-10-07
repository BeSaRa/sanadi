import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {LicenseService} from "@app/services/license.service";
import {CommonUtils} from '@app/helpers/common-utils';
import {CaseTypes} from '@app/enums/case-types.enum';
import {InitialOfficeApproveCaseStatus} from '@app/enums/initial-office-approve-case-status.enum';
import {PartnerOfficeApproveCaseStatus} from '@app/enums/partner-office-approve-case-status.enum';
import {FinalOfficeApproveCaseStatus} from '@app/enums/final-office-approve-case-status.enum';
import {PartnerApproval} from "@app/models/partner-approval";

@Component({
  selector: 'select-license-popup',
  templateUrl: './select-license-popup.component.html',
  styleUrls: ['./select-license-popup.component.scss']
})
export class SelectLicensePopupComponent {
  displayedColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate'];
  label: keyof ILanguageKeys = "license";
  caseType: number;
  caseStatus: number;
  // isFinalApprovedRequest: boolean = false;
  caseStatusEnumMap: any = {
    [CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL]: InitialOfficeApproveCaseStatus,
    [CaseTypes.PARTNER_APPROVAL]: PartnerOfficeApproveCaseStatus,
    [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: FinalOfficeApproveCaseStatus,
  };

  constructor(public lang: LangService, private dialogRef: DialogRef,
              private licenseService: LicenseService,
              @Inject(DIALOG_DATA_TOKEN) public data: { licenses: InitialApprovalDocument[] | PartnerApproval[], caseRecord: any | undefined, select: boolean }) {
    // this.data.select && (this.displayedColumns = [...this.displayedColumns, 'action']) && (this.label = "select_license");
    this.caseType = this.data.caseRecord?.caseType;
    this.caseStatus = this.data.caseRecord?.caseStatus;
    // this.isFinalApprovedRequest = this._isFinalApprovedRequest();
    this.displayedColumns = [...this.displayedColumns, 'action'];
    if (this.data.select) {
      this.label = "select_license";
    }
  }

  private _isFinalApprovedRequest(): boolean {
    if (!CommonUtils.isValidValue(this.caseStatus)) {
      return false;
    }
    return this.caseStatus === this.caseStatusEnumMap[this.caseType].FINAL_APPROVE;
  }

  selectLicense(license: InitialApprovalDocument) {
    this.dialogRef.close(license);
  }

  viewLicenseAsPDF(license: InitialApprovalDocument) {
    /*if (!this.isFinalApprovedRequest) {
      return;
    }*/
    return this.licenseService.showLicenseContent(license, this.caseType)
      .subscribe((file) => {
        if (file.blob.type === 'error') {
          return;
        }
        return this.licenseService.openLicenseFullContentDialog(file, license);
      });
  }
}
