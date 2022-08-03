import { Observable } from 'rxjs';
import { UrgentInterventionReportResult } from './../models/urgent-intervention-report-result';
import { UrgentInterventionReportSearchCriteria } from './../models/urgent-intervention-report-search-criteria';
import { LicenseService } from './license.service';
import { EServiceGenericService } from '@app/generics/e-service-generic-service';
import { FactoryService } from './factory.service';
import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionFinancialNotificationService extends EServiceGenericService<UrgentInterventionFinancialNotification> {
  interceptor!: IModelInterceptor<UrgentInterventionFinancialNotification>;
  jsonSearchFile: string = '';
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_financial_notification';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = [];
  // 'interventionName',
  selectLicenseDisplayColumns = ['beneficiaryCountry', 'executionCountry', 'subject', 'licenseNumber', 'actions'];

  constructor(
    private urlService: UrlService,
    public http: HttpClient,
    public dialog: DialogService,
    private licenseService: LicenseService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService
  ) {
    super()
    FactoryService.registerService('UrgentInterventionFinancialNotificationService', this);
  }
  _getUrlService(): UrlService {
    return this.urlService;
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION
  }
  _getModel() {
    return UrgentInterventionFinancialNotification;
  }
  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionFinancialNotification>> {
    return this.interceptor
  }
  getSearchCriteriaModel<S extends UrgentInterventionFinancialNotification>(): UrgentInterventionFinancialNotification {
    throw new Error('Method not implemented.');
  }
  getCaseComponentName(): string {
    return 'UrgentInterventionFinancialNotificationComponent';
  }

  licenseSearch(criteria: Partial<UrgentInterventionReportSearchCriteria> = {}): Observable<UrgentInterventionReportResult[]> {
    return this.licenseService.urgentInterventionAnnouncementSearch(criteria);
  }
}
