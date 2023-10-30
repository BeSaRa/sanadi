import { Component, Inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LicenseService } from '@app/services/license.service';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { InboxService } from '@app/services/inbox.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { FinancialAnalysis } from '@app/models/financial-analysis';

@Component({
  selector: 'select-license-popup',
  templateUrl: './select-license-popup.component.html',
  styleUrls: ['./select-license-popup.component.scss']
})
export class SelectLicensePopupComponent {
  displayedColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate'];
  label: keyof ILanguageKeys = 'license';
  caseType: number;
  caseTypeViewLicense!: number;
  caseStatus: number;
  requestType: number;
  fileIconsEnum = FileIconsEnum;
  caseService?: BaseGenericEService<any>;

  // generalAssociationService: GeneralAssociationMeetingAttendanceService;

  constructor(public lang: LangService, private dialogRef: DialogRef,
    private licenseService: LicenseService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      licenses: any[],
      caseRecord: any | undefined,
      select: boolean,
      displayedColumns: string[],
      isNotLicense: boolean
    }) {
    this.caseType = this.data.caseRecord?.getCaseType();
    this.caseStatus = this.data.caseRecord?.getCaseStatus();
    this.requestType = this.data.caseRecord?.getRequestType() || -1;
    this.caseService = this.inboxService.getService(this.caseType);
    this.caseTypeViewLicense = SelectLicensePopupComponent._getCaseTypeForViewLicense(this.caseType, this.requestType);

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
      this.label = 'select_license';
    }
  }

  private static _getCaseTypeForViewLicense(caseType: number, requestType: number) {
    let caseTypeForView;
    // urgent intervention closure opens the license list from urgent intervention reporting,
    // so there is no view for urgent intervention closure too
    switch (caseType) {
      case CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL:
        caseTypeForView = (requestType === ServiceRequestTypes.NEW) ? CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL : caseType;
        break;
      case CaseTypes.URGENT_INTERVENTION_CLOSURE:
      case CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP:
        caseTypeForView = CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT;
        break;
      default:
        caseTypeForView = caseType;
        break;
    }
    return caseTypeForView;
  }

  selectLicense(license: any): void {
    if (this.caseType === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
      (this.caseService as GeneralAssociationMeetingAttendanceService).validateLicenseByRequestType(this.requestType, license.fullSerial).subscribe((licenseDetails) => {
        if (!licenseDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: licenseDetails });
      });
    } else if (this.caseType === CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION) {
      this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(license.id).subscribe((licenseDetails) => {
        if (!licenseDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: licenseDetails });
      });
    } else if (this.caseType === CaseTypes.GENERAL_PROCESS_NOTIFICATION) {
      this.licenseService.validateLicenseByRequestType(this.caseType, this.requestType, license.fullSerial).subscribe((requestDetails) => {
        if (!requestDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: requestDetails });
      });
    } else if (this.caseType === CaseTypes.FINANCIAL_TRANSFERS_LICENSING) {
      this.licenseService.validateLicenseByRequestType(this.caseType, this.requestType, license.id).subscribe((requestDetails) => {
        if (!requestDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: requestDetails });
      });
    }else if (this.caseType === CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP) {
      this.licenseService.validateLicenseByRequestType(this.caseType, this.requestType, license.vsId).subscribe((requestDetails) => {
        if (!requestDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: requestDetails });
      });
    }else if (this.caseType === CaseTypes.FINANCIAL_ANALYSIS) {
      this.licenseService.loadFinancialAnalysisById((license as unknown as FinancialAnalysis).fullSerial).subscribe((requestDetails) => {
        if (!requestDetails) {
          return;
        }
        this.dialogRef.close({ selected: license, details: requestDetails });
      });
    }
     else {
      this.licenseService.validateLicenseByRequestType(this.caseType, this.requestType, license.id)
        .subscribe((licenseDetails) => {
          if (!licenseDetails) {
            return;
          }
          this.dialogRef.close({ selected: license, details: licenseDetails });
        });
    }
  }
}
