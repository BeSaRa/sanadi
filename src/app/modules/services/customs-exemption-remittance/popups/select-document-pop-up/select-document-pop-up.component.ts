import { Component, Inject } from '@angular/core';
import { FileIconsEnum } from '@enums/file-extension-mime-types-icons.enum';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { CustomsExemptionRemittance } from '@models/customs-exemption-remittance';
import { InboxService } from '@services/inbox.service';
import { LangService } from '@services/lang.service';
import { SharedService } from '@services/shared.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomsExemptionRemittanceService } from '@services/customs-exemption-remittance.service';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'select-document-pop-up',
  templateUrl: './select-document-pop-up.component.html',
  styleUrls: ['./select-document-pop-up.component.scss'],
})
export class SelectDocumentPopUpComponent {
  displayedColumns: string[] = ['shipmentSource', 'shipmentCarrier', 'receiverName', 'orderNumber', 'documentNumber'];
  label: keyof ILanguageKeys = 'document';
  caseType: number;
  caseStatus: number;
  requestType: number;
  fileIconsEnum = FileIconsEnum;
  caseService?: BaseGenericEService<any>;

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              private customsExemptionRemittanceService: CustomsExemptionRemittanceService,
              private inboxService: InboxService,
              private _sharedService: SharedService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: {
                documents: CustomsExemptionRemittance[];
                caseRecord: any | undefined;
                select: boolean;
                displayedColumns: string[];
              }) {
    this.caseType = this.data.caseRecord?.getCaseType();
    this.caseStatus = this.data.caseRecord?.getCaseStatus();
    this.requestType = this.data.caseRecord?.getRequestType();
    this.caseService = this.inboxService.getService(this.caseType);

    if (this.data.displayedColumns.length > 0) {
      this.displayedColumns = [...this.data.displayedColumns];
    } else {
      if (this.caseService && !!this.caseService.selectLicenseDisplayColumns && this.caseService.selectLicenseDisplayColumns.length > 0) {
        this.displayedColumns = [...this.caseService.selectLicenseDisplayColumns,];
      } else {
        this.displayedColumns = [...this.displayedColumns];
      }
    }

    if (!this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }

    if (this.data.select) {
      this.label = 'select_document';
    }
  }

  selectDocument(document: CustomsExemptionRemittance): void {
    this.customsExemptionRemittanceService.validateDocumentByRequestType(this.caseType, this.requestType, document.fullSerial)
      .subscribe((documentDetails) => {
        if (!documentDetails) {
          return;
        }
        this.dialogRef.close({selected: document, details: documentDetails});
      });
  }

  /*viewDocumentAsPDF(document: CustomsExemptionRemittance) {
    let doc = {...document, documentTitle: document.fullSerial};
    return this.customsExemptionRemittanceService.showDocumentContent(doc, this.caseType)
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, doc);
      });
  }*/
}
