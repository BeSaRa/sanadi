import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {LicenseService} from "@app/services/license.service";

@Component({
  selector: 'select-license-popup',
  templateUrl: './select-license-popup.component.html',
  styleUrls: ['./select-license-popup.component.scss']
})
export class SelectLicensePopupComponent {
  displayedColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate'];
  label: keyof ILanguageKeys = "license";
  caseType: number;

  constructor(public lang: LangService, private dialogRef: DialogRef,
              private licenseService: LicenseService,
              @Inject(DIALOG_DATA_TOKEN) public data: { licenses: InitialApprovalDocument[], caseType: number, select: boolean }) {
    this.data.select && (this.displayedColumns = [...this.displayedColumns, 'action']) && (this.label = "select_license");
    this.caseType = this.data.caseType;
  }

  selectLicense(license: InitialApprovalDocument) {
    this.dialogRef.close(license);
  }

  viewLicenseAsPDF(license: InitialApprovalDocument) {
    return this.licenseService.showLicenseContent(license, this.caseType)
      .subscribe((file) => {
        if (file.blob.type === 'error') {
          return;
        }
        return this.licenseService.openLicenseFullContentDialog(file, license);
      });
  }
}
