import { Injectable } from '@angular/core';
import { UrgentInterventionClosure } from '@app/models/urgent-intervention-closure';
import { UrlService } from '@services/url.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '@services/dialog.service';
import { DynamicOptionsService } from '@services/dynamic-options.service';
import { LicenseService } from '@services/license.service';
import { HttpClient } from '@angular/common/http';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { SearchUrgentInterventionClosureCriteria } from '@app/models/search-urgent-intervention-closure-criteria';
import { UrgentInterventionAnnouncementSearchCriteria } from '@app/models/urgent-intervention-announcement-search-criteria';
import { Observable } from 'rxjs';
import { UrgentInterventionAnnouncementResult } from '@app/models/urgent-intervention-announcement-result';
import { UrgentInterventionClosureInterceptor } from '@app/model-interceptors/urgent-intervention-closure-interceptor';
import { FactoryService } from '@services/factory.service';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { ImplementingAgencyInterceptor } from '@app/model-interceptors/implementing-agency-interceptor';
import { InterventionRegion } from '@app/models/intervention-region';
import { InterventionRegionInterceptor } from '@app/model-interceptors/intervention-region-interceptor';
import { InterventionField } from '@app/models/intervention-field';
import { InterventionFieldInterceptor } from '@app/model-interceptors/intervention-field-interceptor';
import { OfficeEvaluation } from '@app/models/office-evaluation';
import { OfficeEvaluationInterceptor } from '@app/model-interceptors/office-evaluation-interceptor';
import { Result } from '@app/models/result';
import { ResultInterceptor } from '@app/model-interceptors/result-interceptor';
import { Stage } from '@app/models/stage';
import { StageInterceptor } from '@app/model-interceptors/stage-interceptor';
import { BestPractices } from '@app/models/best-practices';
import { BestPracticesInterceptor } from '@app/model-interceptors/best-practices-interceptor';
import { LessonsLearned } from '@app/models/lessons-learned';
import { LessonsLearnedInterceptor } from '@app/model-interceptors/lessons-learned-interceptor';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import {
  UrgentInterventionClosureApproveTaskPopupComponent
} from '@app/modules/services/urgent-intervention-closure/popups/urgent-intervention-closure-approve-task-popup/urgent-intervention-closure-approve-task-popup.component';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionClosure
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionClosureService extends BaseGenericEService<UrgentInterventionClosure> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentInterventionClosureService', this);
  }

  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'createdOn', 'caseStatus', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = ['beneficiaryCountry', 'executionCountry', 'subject', 'fullSerial', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_closure';
  jsonSearchFile: string = 'urgent_intervention_closure_search_form.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<UrgentInterventionClosure> = new UrgentInterventionClosureInterceptor();
  implementingAgencyInterceptor: IModelInterceptor<ImplementingAgency> = new ImplementingAgencyInterceptor();
  interventionRegionInterceptor: IModelInterceptor<InterventionRegion> = new InterventionRegionInterceptor();
  interventionFieldInterceptor: IModelInterceptor<InterventionField> = new InterventionFieldInterceptor();
  officeEvaluationInterceptor: IModelInterceptor<OfficeEvaluation> = new OfficeEvaluationInterceptor();
  resultInterceptor: IModelInterceptor<Result> = new ResultInterceptor();
  stageInterceptor: IModelInterceptor<Stage> = new StageInterceptor();
  bestPracticesInterceptor: IModelInterceptor<BestPractices> = new BestPracticesInterceptor();
  lessonsLearnedInterceptor: IModelInterceptor<LessonsLearned> = new LessonsLearnedInterceptor();

  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionClosure>> {
    return this.interceptor;
  }

  _getModel(): any {
    return UrgentInterventionClosure;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_CLOSURE;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }


  getCaseComponentName(): string {
    return 'UrgentInterventionClosureComponent';
  }

  getSearchCriteriaModel<S extends UrgentInterventionClosure>(): UrgentInterventionClosure {
    return new SearchUrgentInterventionClosureCriteria();
  }

  licenseSearch(criteria: Partial<UrgentInterventionClosure> = {}): Observable<UrgentInterventionClosure[]> {
    return this.licenseService.urgentInterventionClosureSearch(criteria);
  }

  licenseSearchUrgentInterventionAnnouncement(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria> = {}): Observable<UrgentInterventionAnnouncementResult[]> {
    return this.licenseService.urgentInterventionAnnouncementSearchValidOnly(criteria);
  }

  approveTask(model: UrgentInterventionClosure, action: WFResponseType): DialogRef {
    return this.dialog.show(UrgentInterventionClosureApproveTaskPopupComponent, {
      model,
      action
    })
  }
}
