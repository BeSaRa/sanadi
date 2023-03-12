import { Injectable } from '@angular/core';
import { UrlService } from '@app/services/url.service';
import { UrgentInterventionLicense } from '@app/models/urgent-intervention-license';
import { FactoryService } from '@app/services/factory.service';
import { HttpClient } from '@angular/common/http';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { UrgentInterventionLicenseInterceptor } from '@app/model-interceptors/urgent-intervention-license-interceptor';
import { DialogService } from '@app/services/dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicOptionsService } from '@app/services/dynamic-options.service';
import { SearchUrgentInterventionLicenseCriteria } from '@app/models/search-urgent-intervention-license-criteria';
import { UrgentInterventionLicenseSearchCriteria } from '@app/models/urgent-intervention-license-search-criteria';
import { Observable } from 'rxjs';
import { UrgentInterventionLicenseResult } from '@app/models/urgent-intervention-license-result';
import { LicenseService } from '@app/services/license.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogRef } from "@app/shared/models/dialog-ref";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import {
  UrgentInterventionApproveTaskPopupComponent
} from "@app/modules/services/urgent-intervention-licensing/popups/urgent-intervention-approve-task-popup/urgent-intervention-approve-task-popup.component";
import { CastResponseContainer } from "@decorators/cast-response";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionLicense
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionLicensingService extends BaseGenericEService<UrgentInterventionLicense> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentInterventionLicensingService', this);
  }

  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'createdOn', 'caseStatus', 'projectName', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'fullSerial', 'status', 'endDate', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_license';
  jsonSearchFile: string = 'urgent_intervention_license_search_form.json';
  interceptor: IModelInterceptor<UrgentInterventionLicense> = new UrgentInterventionLicenseInterceptor();
  caseStatusIconMap: Map<number, string> = new Map<number, string>();

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'UrgentInterventionLicenseComponent';
  }

  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionLicense>> {
    return this.interceptor;
  }

  _getModel(): any {
    return UrgentInterventionLicense;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_LICENSE;
  }

  getSearchCriteriaModel<S extends UrgentInterventionLicense>(): UrgentInterventionLicense {
    return new SearchUrgentInterventionLicenseCriteria();
  }

  licenseSearch(criteria: Partial<UrgentInterventionLicenseSearchCriteria> = {}): Observable<UrgentInterventionLicenseResult[]> {
    return this.licenseService.urgentInterventionLicenseSearch(criteria);
  }

  approveTask(model: UrgentInterventionLicense, action: WFResponseType): DialogRef {
    return this.dialog.show(UrgentInterventionApproveTaskPopupComponent, {
      model,
      action
    })
  }


}
