import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

@Component({
  selector: 'select-license-popup',
  templateUrl: './select-license-popup.component.html',
  styleUrls: ['./select-license-popup.component.scss']
})
export class SelectLicensePopupComponent {
  displayedColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate'];
  label: keyof ILanguageKeys = "license";

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: { licenses: InitialApprovalDocument[], select: boolean }) {
    this.data.select && (this.displayedColumns = [...this.displayedColumns, 'action']) && (this.label = "select_license");
  }

  selectLicense(license: InitialApprovalDocument) {
    this.dialogRef.close(license);
  }
}
