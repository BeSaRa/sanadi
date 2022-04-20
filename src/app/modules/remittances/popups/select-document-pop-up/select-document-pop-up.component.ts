import { Component, Inject, OnInit } from "@angular/core";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { EServiceGenericService } from "@app/generics/e-service-generic-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { ShippingApproval } from "@app/models/shipping-approval";
import { CustomsExemptionRemittanceService } from "@app/services/customs-exemption-remittance.service";
import { InboxService } from "@app/services/inbox.service";
import { LangService } from "@app/services/lang.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";

@Component({
  selector: "select-document-pop-up",
  templateUrl: "./select-document-pop-up.component.html",
  styleUrls: ["./select-document-pop-up.component.scss"],
})
export class SelectDocumentPopUpComponent {
  displayedColumns: string[] = [
    "shipmentSource",
    "shipmentCarrier",
    "receiverName",
    "documentNumber"
  ];
  label: keyof ILanguageKeys = "document";
  caseType: number;
  caseStatus: number;
  requestType: number;
  fileIconsEnum = FileIconsEnum;
  caseService?: EServiceGenericService<any>;

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    private customsExemptionRemittanceService: CustomsExemptionRemittanceService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      documents: ShippingApproval[];
      caseRecord: any | undefined;
      select: boolean;
      displayedColumns: string[];
    }
  ) {
    console.log(data.documents)
    this.caseType = this.data.caseRecord?.getCaseType();
    this.caseStatus = this.data.caseRecord?.getCaseStatus();
    this.requestType = this.data.caseRecord?.getRequestType();
    this.caseService = this.inboxService.getService(this.caseType);

    if (this.data.displayedColumns.length > 0) {
      this.displayedColumns = [...this.data.displayedColumns];
    } else {
      if (
        this.caseService &&
        !!this.caseService.selectLicenseDisplayColumns &&
        this.caseService.selectLicenseDisplayColumns.length > 0
      ) {
        this.displayedColumns = [
          ...this.caseService.selectLicenseDisplayColumns,
        ];
      } else {
        this.displayedColumns = [...this.displayedColumns];
      }
    }

    if (!this.displayedColumns.includes("actions")) {
      this.displayedColumns.push("actions");
    }

    if (this.data.select) {
      this.label = "select_document";
    }
  }

  selectDocument(document:ShippingApproval): void {
    this.customsExemptionRemittanceService.validateDocumentByRequestType(this.caseType, this.requestType, document.id)
      .subscribe((documentDetails) => {
        if (!documentDetails) {
          return;
        }
        this.dialogRef.close({selected: document, details: documentDetails});
      });
  }
}
