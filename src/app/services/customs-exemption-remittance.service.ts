import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Generator } from "@app/decorators/generator";
import { ShippingApprovalInterceptor } from "@app/model-interceptors/shipping-approval-interceptor";
import { ShippingApproval } from "@app/models/shipping-approval";
import { ShippingApprovalSearchCriteria } from "@app/models/shipping-approval-search-criteria";
import { Observable } from "rxjs";
import { EmployeeService } from "./employee.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class CustomsExemptionRemittanceService {
  constructor(
    private http: HttpClient,
    public urlService: UrlService,
    private employeeService: EmployeeService
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
}
