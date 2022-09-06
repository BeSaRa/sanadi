import {
  UrgentInterventionFinancialNotificationSearchCriteria
} from './../models/urgent-intervention-financial-notification-search-criteria';
import {
  UrgentInterventionFinancialNotificationInterceptor
} from './../model-interceptors/urgent-intervention-financial-notification-interceptor';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionField } from '@app/models/intervention-field';
import { InterventionFieldInterceptor } from '@app/model-interceptors/intervention-field-interceptor';
import { InterventionRegionInterceptor } from '@app/model-interceptors/intervention-region-interceptor';
import { ImplementingAgencyInterceptor } from '@app/model-interceptors/implementing-agency-interceptor';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { Observable } from 'rxjs';
import { UrgentInterventionAnnouncementResult } from '../models/urgent-intervention-announcement-result';
import { UrgentInterventionAnnouncementSearchCriteria } from '../models/urgent-intervention-announcement-search-criteria';
import { LicenseService } from './license.service';
import { FactoryService } from './factory.service';
import { Injectable } from '@angular/core';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionFinancialNotification
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionFinancialNotificationService extends BaseGenericEService<UrgentInterventionFinancialNotification> {
  interceptor: IModelInterceptor<UrgentInterventionFinancialNotification> = new UrgentInterventionFinancialNotificationInterceptor();
  jsonSearchFile: string = 'urgent_intervention_financial_search_form.json';
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_financial_notification';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'createdOn', 'caseStatus', 'ouInfo', 'subject'];
  selectLicenseDisplayColumns = ['beneficiaryCountry', 'executionCountry', 'subject', 'licenseNumber', 'actions'];

  implementingAgencyInterceptor: IModelInterceptor<ImplementingAgency> = new ImplementingAgencyInterceptor();
  interventionRegionInterceptor: IModelInterceptor<InterventionRegion> = new InterventionRegionInterceptor();
  interventionFieldInterceptor: IModelInterceptor<InterventionField> = new InterventionFieldInterceptor();
  constructor(
    private urlService: UrlService,
    public http: HttpClient,
    public dialog: DialogService,
    private licenseService: LicenseService,
    public domSanitizer: DomSanitizer,
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
    return new UrgentInterventionFinancialNotificationSearchCriteria();
  }
  getCaseComponentName(): string {
    return 'UrgentInterventionFinancialNotificationComponent';
  }

  licenseSearch(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria> = {}): Observable<UrgentInterventionAnnouncementResult[]> {
    return this.licenseService.urgentInterventionAnnouncementSearch(criteria);
  }
}
