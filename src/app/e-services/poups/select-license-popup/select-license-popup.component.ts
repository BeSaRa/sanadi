import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {InitialExternalOfficeApprovalResult} from "@app/models/initial-external-office-approval-result";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {LicenseService} from "@app/services/license.service";
import {PartnerApproval} from "@app/models/partner-approval";
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {SharedService} from '@app/services/shared.service';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {InboxService} from '@app/services/inbox.service';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {CaseTypes} from "@app/enums/case-types.enum";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {CollectorApproval} from '@app/models/collector-approval';
import { Fundraising } from '@app/models/fundraising';

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
  requestType: number;
  fileIconsEnum = FileIconsEnum;
  caseService?: EServiceGenericService<any>;

  constructor(public lang: LangService, private dialogRef: DialogRef,
              private licenseService: LicenseService,
              private inboxService: InboxService,
              private sharedService: SharedService,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                licenses: (InitialExternalOfficeApprovalResult[] | PartnerApproval[] | FinalExternalOfficeApprovalResult[] | InternalProjectLicenseResult[] | Fundraising[]),
                caseRecord: any | undefined,
                select: boolean,
                displayedColumns: string[]
              }) {
    this.caseType = this.data.caseRecord?.getCaseType();
    this.caseStatus = this.data.caseRecord?.getCaseStatus();
    this.requestType = this.data.caseRecord?.getRequestType();
    this.caseService = this.inboxService.getService(this.caseType);


    if (this.data.displayedColumns.length > 0) {
      this.displayedColumns = [...this.data.displayedColumns];
    } else {
      if (this.caseService && !!this.caseService.selectLicenseDisplayColumns && this.caseService.selectLicenseDisplayColumns.length > 0) {
        this.displayedColumns = [...this.caseService.selectLicenseDisplayColumns];
      } else {
        this.displayedColumns = [...this.displayedColumns];
      }
    }

    if (!this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }

    if (this.data.select) {
      this.label = "select_license";
    }
  }

  selectLicense(license: (InitialExternalOfficeApprovalResult | CollectorApproval | PartnerApproval | FinalExternalOfficeApprovalResult | InternalProjectLicenseResult)): void {
    this.licenseService.validateLicenseByRequestType(this.caseType, this.requestType, license.id)
      .subscribe((licenseDetails) => {
        if (!licenseDetails) {
          return;
        }
        this.dialogRef.close({selected: license, details: licenseDetails});
      });
  }

  viewLicenseAsPDF(license: (InitialExternalOfficeApprovalResult | CollectorApproval | PartnerApproval | FinalExternalOfficeApprovalResult | InternalProjectLicenseResult | Fundraising)) {
    return this.licenseService.showLicenseContent(license, (this.caseType === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL && this.requestType === ServiceRequestTypes.NEW) ? CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL : this.caseType)
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, license);
      });
  }
}
