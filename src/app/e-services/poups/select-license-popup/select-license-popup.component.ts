import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Component({
  selector: 'select-license-popup',
  templateUrl: './select-license-popup.component.html',
  styleUrls: ['./select-license-popup.component.scss']
})
export class SelectLicensePopupComponent {
  displayedColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'action'];

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public list: InitialApprovalDocument[]) {
  }

  selectLicense(license: InitialApprovalDocument) {
    this.dialogRef.close(license);
  }
}
