import { HttpClient } from "@angular/common/http";
import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { EServiceGenericService } from "@app/generics/e-service-generic-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ShippingApprovalInterceptor } from "@app/model-interceptors/shipping-approval-interceptor";
import { ShippingApproval } from "@app/models/shipping-approval";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class ShippingApprovalService extends EServiceGenericService<ShippingApproval> {
  jsonSearchFile: string = ""; // will understand later
  interceptor: IModelInterceptor<ShippingApproval> =
    new ShippingApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = "menu_shipping_services_approval";
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = []; // will understand later

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService,
    private urlService: UrlService
  ) {
    super();
    FactoryService.registerService("ShippingApprovalService", this);
  }

  _getModel() {
    return ShippingApproval;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.CUSTOMS_EXEMPTION_SHIPPING_APPROVAL_SERVICES;
  }

  _getInterceptor(): Partial<IModelInterceptor<ShippingApproval>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends ShippingApproval>(): ShippingApproval {
    throw new Error("Method not implemented.");
  }

  getCaseComponentName(): string {
    return "ShippingApprovalComponent";
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }
}
