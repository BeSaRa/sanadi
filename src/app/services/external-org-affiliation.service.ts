import { LangService } from './lang.service';
import { FactoryService } from './factory.service';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
@CastResponseContainer({
  $default: {
    model: () => ExternalOrgAffiliation,
    shape: {}
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalOrgAffiliationService extends BaseGenericEService<ExternalOrgAffiliation>  {

  jsonSearchFile: string = 'external_org_affiliation_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_external_org_affiliation_request';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ["fullSerial",
    "caseStatus",
    "creatorInfo",
    "createdOn",
    "subject"];

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
    FactoryService.registerService('ExternalOrgAffiliationService', this);
  }
  _getUrlService(): UrlService {
    return this.urlService
  }
  _getURLSegment(): string {
    return this.urlService.URLS.EXTERNAL_ORG_AFFILIATION_REQUEST
  }
  _getModel() {
    return ExternalOrgAffiliation
  }
  getSearchCriteriaModel<S extends ExternalOrgAffiliation>(): ExternalOrgAffiliation {
    return new ExternalOrgAffiliation();
  }
  getCaseComponentName(): string {
    return "ExternalOrgAffiliationComponent"
  }

}
