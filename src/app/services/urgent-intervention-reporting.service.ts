import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {FactoryService} from '@app/services/factory.service';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrlService} from '@app/services/url.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DialogService} from '@app/services/dialog.service';
import {DynamicOptionsService} from '@app/services/dynamic-options.service';
import {LicenseService} from '@app/services/license.service';
import {HttpClient} from '@angular/common/http';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {UrgentInterventionReportInterceptor} from '@app/model-interceptors/urgent-intervention-report-interceptor';
import {SearchUrgentInterventionReportCriteria} from '@app/models/search-urgent-intervention-report-criteria';
import {InterventionRegion} from '@app/models/intervention-region';
import {InterventionRegionInterceptor} from '@app/model-interceptors/intervention-region-interceptor';
import {InterventionField} from '@app/models/intervention-field';
import {InterventionFieldInterceptor} from '@app/model-interceptors/intervention-field-interceptor';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {ImplementingAgencyInterceptor} from '@app/model-interceptors/implementing-agency-interceptor';
import {Observable} from 'rxjs';
import {UrgentInterventionReportSearchCriteria} from '@app/models/urgent-intervention-report-search-criteria';
import {UrgentInterventionReportResult} from '@app/models/urgent-intervention-report-result';
import {IDefaultResponse} from '@contracts/idefault-response';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionReportingService extends EServiceGenericService<UrgentInterventionReport> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentInterventionReportingService', this);
  }

  searchColumns: string[] = ['fullSerial', 'subject', 'createdOn', 'caseStatus', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'fullSerial', 'status', 'endDate', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_report';
  jsonSearchFile: string = 'urgent_intervention_report_search_form.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<UrgentInterventionReport> = new UrgentInterventionReportInterceptor();
  implementingAgencyInterceptor: IModelInterceptor<ImplementingAgency> = new ImplementingAgencyInterceptor();
  interventionRegionInterceptor: IModelInterceptor<InterventionRegion> = new InterventionRegionInterceptor();
  interventionFieldInterceptor: IModelInterceptor<InterventionField> = new InterventionFieldInterceptor();

  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionReport>> {
    return this.interceptor;
  }

  _getModel(): any {
    return UrgentInterventionReport;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_REPORTING;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'UrgentInterventionReportComponent';
  }

  getSearchCriteriaModel<S extends UrgentInterventionReport>(): UrgentInterventionReport {
    return new SearchUrgentInterventionReportCriteria();
  }

  licenseSearch(criteria: Partial<UrgentInterventionReportSearchCriteria> = {}): Observable<UrgentInterventionReportResult[]> {
    return this.licenseService.urgentInterventionReportSearch(criteria);
  }

  /**
   * @description Check if intervention license exists
   * If exists, serial/license number will be returned, otherwise empty string
   */
  validateAddLicense(): Observable<boolean> {
    return this.http.get<IDefaultResponse<string | boolean>>(this._getURLSegment() + '/validateAdd')
      .pipe(map((response) => !!response.rs));
  }
}
