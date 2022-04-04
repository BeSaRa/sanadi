import { HttpClient } from "@angular/common/http";
import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { EServiceGenericService } from "@app/generics/e-service-generic-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { FundraisingInterceptor } from "@app/model-interceptors/fundraising-interceptor";
import { Fundraising } from "@app/models/fundraising";
import { FundraisingSearchCriteria } from "@app/models/FundRaisingSearchCriteria";
import { Observable } from "rxjs";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { FactoryService } from "./factory.service";
import { LicenseService } from "./license.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class FundraisingService extends EServiceGenericService<Fundraising> {
  jsonSearchFile: string = "fundraising_search.json";  // will understand later
  interceptor: IModelInterceptor<Fundraising> = new FundraisingInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_fundraising';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial','requestTypeInfo', 'creatorInfo', 'caseStatus', 'createdOn'];   // will understand later

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService,
    private urlService: UrlService,
    private licenseService: LicenseService
  ) {
    super();
    FactoryService.registerService("FundraisingService", this);
  }

  _getModel() {
    return Fundraising;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.FUNDRAISING;
  }

  _getInterceptor(): Partial<IModelInterceptor<Fundraising>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends Fundraising>(): Fundraising {
    return new FundraisingSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'FundraisingComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  licenseSearch(criteria: Partial<FundraisingSearchCriteria> = {}): Observable<Fundraising[]> {
    return this.licenseService.fundRaisingLicenseSearch(criteria);
  }
}
