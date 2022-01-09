import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {InitialExternalOfficeApprovalInterceptor} from "@app/model-interceptors/initial-external-office-approval-interceptor";
import {FactoryService} from "@app/services/factory.service";
import {UrlService} from "@app/services/url.service";
import {LicenseService} from "@app/services/license.service";
import {InitialExternalOfficeApprovalSearchCriteria} from "@app/models/initial-external-office-approval-search-criteria";
import {Observable} from "rxjs";
import {InitialExternalOfficeApprovalResult} from "@app/models/initial-external-office-approval-result";
import {InitialExternalOfficeApprovalComponent} from "@app/e-services/pages/initial-external-office-approval/initial-external-office-approval.component";
import {SearchInitialExternalOfficeApprovalCriteria} from "@app/models/search-initial-external-office-approval-criteria";
import {SearchService} from "@app/services/search.service";

@Injectable({
  providedIn: 'root'
})
export class InitialExternalOfficeApprovalService extends EServiceGenericService<InitialExternalOfficeApproval> {
  jsonSearchFile: string = 'initial_external_office_approval.json';
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'fullSerial', 'status', 'endDate', 'actions'];
  interceptor: IModelInterceptor<InitialExternalOfficeApproval> = new InitialExternalOfficeApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_initial_external_office_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'subject', 'createdOn', 'caseStatus', 'ouInfo', 'creatorInfo'];
  searchService: SearchService = new SearchService(this);

  constructor(public dynamicService: DynamicOptionsService,
              public domSanitizer: DomSanitizer,
              public http: HttpClient,
              public dialog: DialogService,
              public urlService: UrlService,
              private licenseService: LicenseService,
              public cfr: ComponentFactoryResolver) {
    super();
    FactoryService.registerService('InitialExternalOfficeApprovalService', this);
  }

  _getModel() {
    return InitialExternalOfficeApproval;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INITIAL_OFFICE_APPROVAL;
  }

  _getInterceptor(): Partial<IModelInterceptor<InitialExternalOfficeApproval>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends InitialExternalOfficeApproval>(): InitialExternalOfficeApproval {
    return new SearchInitialExternalOfficeApprovalCriteria();
  }

  getCaseComponentName(): string {
    return 'InitialExternalOfficeApprovalComponent';
  }

  licenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria> = {}): Observable<InitialExternalOfficeApprovalResult[]> {
    return this.licenseService.initialLicenseSearch(criteria);
  }
}
