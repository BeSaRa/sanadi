import { HttpClient } from "@angular/common/http";
import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { CoordinationWithOrganizationsRequest } from "@app/models/coordination-with-organizations-request";
import { CoordinationWithOrganizationsRequestSearchCriteria } from './../models/coordination-with-organizations-request-search-criteria';
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { FactoryService } from "./factory.service";
import { LangService } from "./lang.service";
import { SearchService } from './search.service';
import { UrlService } from "./url.service";

@CastResponseContainer({
  $default: {
    model: () => CoordinationWithOrganizationsRequest,
  },
})
@Injectable({
  providedIn: "root",
})
export class CoordinationWithOrganizationsRequestService extends BaseGenericEService<CoordinationWithOrganizationsRequest> {
  _getURLSegment(): string {
    return this.urlService.URLS.E_COORDINATION_WITH_ORGANIZATION_REQUEST;
  }
  _getModel() {
    return CoordinationWithOrganizationsRequest;
  }
  getSearchCriteriaModel<
    S extends CoordinationWithOrganizationsRequest
  >(): CoordinationWithOrganizationsRequest {
   return new CoordinationWithOrganizationsRequestSearchCriteria();
  }
  getCaseComponentName(): string {
    return "CoordinationWithOrganizationsRequest";
  }
  jsonSearchFile: string = "coordination_with_organizations_request_search.json";
  serviceKey: keyof ILanguageKeys = "menu_coordination_with_organizations_request";
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchService: SearchService = new SearchService(this);
  searchColumns: string[] = ["fullSerial","fullName","domainInfo","caseStatus","creatorInfo","createdOn"];


  _getUrlService(): UrlService {
    return this.urlService;
  }

  constructor(
    public domSanitizer: DomSanitizer,
    public lang: LangService,
    public http: HttpClient,
    public dynamicService: DynamicOptionsService,
    public cfr: ComponentFactoryResolver,
    private urlService: UrlService,
    public dialog: DialogService
  ) {
    super();
    FactoryService.registerService(
      "CoordinationWithOrganizationsRequestService",
      this
    );
  }
}
