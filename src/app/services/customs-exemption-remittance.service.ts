import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Generator } from "@app/decorators/generator";
import { ShippingApprovalInterceptor } from "@app/model-interceptors/shipping-approval-interceptor";
import { ShippingApproval } from "@app/models/shipping-approval";
import { ShippingApprovalSearchCriteria } from "@app/models/shipping-approval-search-criteria";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable } from "rxjs";
import { DialogService } from "./dialog.service";
import { EmployeeService } from "./employee.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import {SelectDocumentPopUpComponent} from "@app/modules/remittances/popups/select-document-pop-up/select-document-pop-up.component";

@Injectable({
  providedIn: "root",
})
export class CustomsExemptionRemittanceService {
  constructor(
    private http: HttpClient,
    public urlService: UrlService,
    private employeeService: EmployeeService,
    private dialog: DialogService
  ) {
    FactoryService.registerService("CustomsExemptionRemittanceService", this);
  }

  @Generator(ShippingApproval, true, {
    property: "rs",
    interceptReceive: new ShippingApprovalInterceptor().receive,
  })
  shippingApprovalDocumentSearch(
    criteria: Partial<ShippingApprovalSearchCriteria>
  ): Observable<ShippingApproval[]> {
    const orgId = {
      organizationId: this.employeeService.isExternalUser()
        ? this.employeeService.getOrgUnit()?.id
        : undefined,
    };
    return this.http.post<ShippingApproval[]>(
      this.urlService.URLS.CUSTOMS_EXEMPTION_SHIPPING_APPROVAL_SERVICES +
        "/search",
      { ...criteria, ...orgId }
    );
  }

  openSelectDocumentDialog<T>(
    documents: ShippingApproval[] | T[],
    caseRecord: any | undefined,
    select = true,
    displayedColumns: string[] = []
  ): DialogRef {
    return this.dialog.show(SelectDocumentPopUpComponent, {
      documents,
      select,
      caseRecord,
      displayedColumns,
    });
  }
}

