import { Injectable } from '@angular/core';
import { FactoryService } from '@app/services/factory.service';
import { UrgentInterventionAnnouncement } from '@app/models/urgent-intervention-announcement';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { UrlService } from '@app/services/url.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '@app/services/dialog.service';
import { DynamicOptionsService } from '@app/services/dynamic-options.service';
import { LicenseService } from '@app/services/license.service';
import { HttpClient } from '@angular/common/http';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { UrgentInterventionAnnouncementInterceptor } from '@app/model-interceptors/urgent-intervention-announcement-interceptor';
import { SearchUrgentInterventionAnnouncementCriteria } from '@app/models/search-urgent-intervention-announcement-criteria';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionRegionInterceptor } from '@app/model-interceptors/intervention-region-interceptor';
import { InterventionField } from '@app/models/intervention-field';
import { InterventionFieldInterceptor } from '@app/model-interceptors/intervention-field-interceptor';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { ImplementingAgencyInterceptor } from '@app/model-interceptors/implementing-agency-interceptor';
import { Observable, of } from 'rxjs';
import { UrgentInterventionAnnouncementSearchCriteria } from '@app/models/urgent-intervention-announcement-search-criteria';
import { UrgentInterventionAnnouncementResult } from '@app/models/urgent-intervention-announcement-result';
import { IDefaultResponse } from '@contracts/idefault-response';
import { map } from 'rxjs/operators';
import { UrgentInterventionAnnouncementRequestType } from '@app/enums/service-request-types';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionAnnouncement
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionAnnouncementService extends BaseGenericEService<UrgentInterventionAnnouncement> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentInterventionAnnouncementService', this);
  }

  searchColumns: string[] = ['fullSerial', 'subject', 'createdOn', 'caseStatus', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['beneficiaryCountry', 'executionCountry', 'subject', 'fullSerial', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_announcement';
  jsonSearchFile: string = 'urgent_intervention_announcement_search_form.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<UrgentInterventionAnnouncement> = new UrgentInterventionAnnouncementInterceptor();
  implementingAgencyInterceptor: IModelInterceptor<ImplementingAgency> = new ImplementingAgencyInterceptor();
  interventionRegionInterceptor: IModelInterceptor<InterventionRegion> = new InterventionRegionInterceptor();
  interventionFieldInterceptor: IModelInterceptor<InterventionField> = new InterventionFieldInterceptor();
  preValidatedLicenseIdForAddOperation: string = '';

  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionAnnouncement>> {
    return this.interceptor;
  }

  _getModel(): any {
    return UrgentInterventionAnnouncement;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_ANNOUNCEMENT;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'UrgentInterventionAnnouncementComponent';
  }

  getSearchCriteriaModel<S extends UrgentInterventionAnnouncement>(): UrgentInterventionAnnouncement {
    return new SearchUrgentInterventionAnnouncementCriteria();
  }

  licenseSearch(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria>, requestType: UrgentInterventionAnnouncementRequestType): Observable<UrgentInterventionAnnouncementResult[]> {
    if (requestType === UrgentInterventionAnnouncementRequestType.START) {
      criteria.licenseStatus = 1;
    } else if (requestType === UrgentInterventionAnnouncementRequestType.UPDATE) {
      criteria.licenseStatus = 2;
    }
    return this.licenseService.urgentInterventionAnnouncementSearch(criteria);
  }

  /**
   * @description Check if urgent intervention announcement can be added
   */
  preValidateAddLicense(isAddOperation: boolean): Observable<boolean> {
    this.preValidatedLicenseIdForAddOperation = '';

    // if not add operation, allow to access, otherwise pre-validate the data
    // if intervention license exists, allow access, otherwise don't proceed to add
    if (!isAddOperation) {
      return of(true);
    }
    return this.http.get<IDefaultResponse<string | boolean>>(this._getURLSegment() + '/validate-add')
      .pipe(map((response) => {
        this.preValidatedLicenseIdForAddOperation = !!response.rs ? response.rs as string : '';
        return !!response.rs;
      }));
  }
}
