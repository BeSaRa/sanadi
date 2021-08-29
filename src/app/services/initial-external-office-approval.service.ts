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
import {InitialApprovalDocSearchCriteria} from "@app/models/initial-approval-doc-search-criteria";
import {Observable} from "rxjs";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";

@Injectable({
  providedIn: 'root'
})
export class InitialExternalOfficeApprovalService extends EServiceGenericService<InitialExternalOfficeApproval> {
  jsonSearchFile: string = '';
  interceptor: IModelInterceptor<InitialExternalOfficeApproval> = new InitialExternalOfficeApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_initial_external_office_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];

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
    throw new Error('Method not implemented.');
  }

  getCaseComponentName(): string {
    throw new Error('Method not implemented.');
  }

  licenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria> = {}): Observable<InitialApprovalDocument[]> {
    return this.licenseService.initialLicenseSearch(criteria);
  }
}
