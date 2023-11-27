import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ProjectImplementation } from '@app/models/project-implementation';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { FactoryService } from '@services/factory.service';
import { DialogService } from '@services/dialog.service';
import { DynamicOptionsService } from '@services/dynamic-options.service';
import { UrlService } from '@services/url.service';
import {
  ProjectImplementationApproveTaskPopupComponent
} from '@modules/services/project-implementation/popups/project-implementation-approve-task-popup/project-implementation-approve-task-popup.component';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { ProjectModelService } from '@services/project-model.service';
import { Observable, of } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ProjectWorkArea } from '@app/enums/project-work-area';
import { ProjectModel } from '@models/project-model';
import { ProjectTemplate } from '@models/projectTemplate';
import { map, switchMap } from 'rxjs/operators';
import {
  ChooseTemplatePopupComponent
} from '@app/modules/services/shared-services/popups/choose-template-popup/choose-template-popup.component';
import { SharedService } from '@services/shared.service';
import { ImplementationCriteriaContract } from '@contracts/implementation-criteria-contract';
import { ImplementationTemplate } from '@models/implementation-template';
import { CaseTypes } from '@app/enums/case-types.enum';
import {
  ImplementationTemplatePopupComponent
} from '@modules/services/project-implementation/popups/implementation-template-popup/implementation-template-popup.component';
import { MapService } from '@services/map.service';
import { ProjectFundraisingService } from '@services/project-fundraising.service';
import { ProjectFundraising } from '@models/project-fundraising';
import { IDefaultResponse } from '@contracts/idefault-response';
import { LicenseService } from '@services/license.service';
import {
  SelectProjectFundraisingPopupComponent
} from '@modules/services/project-implementation/popups/select-project-fundraising-popup/select-project-fundraising-popup.component';
import { ImplementationFundraising } from '@models/implementation-fundraising';
import { ImplementingAgency } from '@models/implementing-agency';
import { NOT_RETRY_TOKEN } from '@app/http-context/tokens';
import { isArray } from 'lodash';

@CastResponseContainer({
  $default: {
    model: () => ProjectImplementation,
    shape: {
      'implementationTemplate.*': () => ImplementationTemplate,
      'implementingAgencyList.*': () => ImplementingAgency,
      'implementationFundraising.*': () => ImplementationFundraising
    }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProjectImplementationService extends BaseGenericEService<ProjectImplementation> {
  jsonSearchFile: string = 'project_implementation_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_project_implementation';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'subject', 'requestTypeInfo', 'createdOn', 'caseStatus', 'ouInfo'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public dynamicService: DynamicOptionsService,
    private projectModelService: ProjectModelService,
    public domSanitizer: DomSanitizer,
    private sharedService: SharedService,
    private urlService: UrlService,
    private mapService: MapService,
    private licenseService: LicenseService,
    private _projectFundraisingService: ProjectFundraisingService
  ) {
    super();
    FactoryService.registerService('ProjectImplementationService', this);
  }

  _getURLSegment(): string {
    return this.urlService.URLS.PROJECT_IMPLEMENTATION;
  }

  _getModel() {
    return ProjectImplementation;
  }

  getSearchCriteriaModel<S extends ProjectImplementation>(): ProjectImplementation {
    return new ProjectImplementation();
  }

  getCaseComponentName(): string {
    return 'ProjectImplementationComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  approveTask(model: ProjectImplementation, action: WFResponseType) {
    return this.dialog.show(ProjectImplementationApproveTaskPopupComponent, {
      model,
      action: action
    });
  }


  openDialogSearchTemplate(criteria: ImplementationCriteriaContract,
    workArea: ProjectWorkArea,
    requestType: number,
    caseId?: string,
    template?: ImplementationTemplate,
  ): Observable<DialogRef> {
    delete criteria.workArea;
    return this.searchForTemplate(criteria, workArea)
      .pipe(switchMap(templates => templates.length ? of(this.dialog.show(ChooseTemplatePopupComponent, {
        templates,
        implementationTemplate: template,
        caseType: CaseTypes.PROJECT_IMPLEMENTATION,
        workArea,
        caseId,
        requestType
      })) : of(this.dialog.info('there is no templates'))));
  }

  @CastResponse(() => ProjectModel)
  private searchForTemplate(criteria: any, workAreType: ProjectWorkArea): Observable<ProjectModel[]> {
    return this.http.get<ProjectModel[]>(this.urlService.URLS.PROJECT_MODELING + '/' + (workAreType === ProjectWorkArea.OUTSIDE_QATAR ? 'external/' : 'internal/') + 'impl-template/criteria', {
      params: new HttpParams({ fromObject: criteria })
    });
  }

  viewTemplate(template: ProjectTemplate): Observable<DialogRef> {
    return this.projectModelService.exportTemplate(template.templateId)
      .pipe(map((blob) => {
        return this.sharedService.openViewContentDialog(blob, { documentTitle: template.templateFullSerial }) as DialogRef;
      }));
  }

  openImplementationTemplateDialog(template: ImplementationTemplate, readonly: boolean = false): DialogRef {
    return this.dialog.show(ImplementationTemplatePopupComponent, { template, readonly });
  }

  openMap(viewOnly: boolean = false, model: ImplementationTemplate): DialogRef {
    return this.mapService.openMap({
      viewOnly,
      zoom: 18,
      center: model.hasMarker() ? model.getLngLat() : model.defaultLatLng,
      marker: model.hasMarker() ? model.getLngLat() : undefined
    });
  }

  @CastResponse(() => ProjectFundraising)
  loadRelatedPermitByTemplate(requestType: number, templateId: string, caseId?: string): Observable<ProjectFundraising | null> {
    return this.http.get<ProjectFundraising | null>(this.urlService.URLS.PROJECT_FUNDRAISING + '/implementation', {
      params: new HttpParams({
        fromObject: {
          requestType,
          templateId,
          ...caseId ? { caseId } : null
        }
      })
    });
  }

  @CastResponse(() => ProjectFundraising)
  getConsumedAmount(fundraisingId: string, templateId: string, caseId: string, requestType: number): Observable<ProjectFundraising> {
    return this.http.get<ProjectFundraising>(this.urlService.URLS.PROJECT_FUNDRAISING + '/license/consumed', {
      params: new HttpParams({
        fromObject: { fundraisingId, templateId, ...caseId ? { caseId } : null, requestType }
      })
    });
  }

  getCriteria(criteria: ImplementationCriteriaContract): ImplementationCriteriaContract {
    return Object.keys(criteria)
    .filter(key => {
      return (isArray(criteria[key as keyof ImplementationCriteriaContract]))
        ?!!(criteria[key as keyof ImplementationCriteriaContract] as []).filter(v => !!v).length
        : !!criteria[key as keyof ImplementationCriteriaContract]
    })
    .reduce((acc, key) => {
      return { ...acc, [key]: criteria[key as keyof ImplementationCriteriaContract] };
    }, {} as ImplementationCriteriaContract);
  }

  @CastResponse(() => ProjectFundraising)
  loadFundraisingLicensesByCriteria(criteria: ImplementationCriteriaContract, workArea: ProjectWorkArea): Observable<ProjectFundraising[]> {
    criteria.country = criteria.countries![0];
    delete criteria.workArea;
    delete criteria.countries;
    return this.http.get<ProjectFundraising[]>(this.urlService.URLS.PROJECT_FUNDRAISING + (workArea === ProjectWorkArea.OUTSIDE_QATAR ? '/external' : '/internal') + '/implementation', {
      params: new HttpParams({
        fromObject: { ...criteria }
      })
    });
  }

  openSelectFundraisingDialog(licenses: ProjectFundraising[], caseId: string, requestType: number, selectedFundraising?: ImplementationFundraising[], templateId?: string): DialogRef {
    return this.dialog.show(SelectProjectFundraisingPopupComponent, {
      models: licenses,
      selected: selectedFundraising,
      templateId,
      caseId,
      requestType
    });
  }

  licenseSearch(criteria: Partial<ProjectImplementation>): Observable<ProjectImplementation[]> {
    return this.licenseService.projectImplementationLicenseSearch(criteria);
  }

  validateTemplate(templateId: string, caseId?: string, requestType?: number): Observable<boolean> {
    return this.http.get<IDefaultResponse<boolean>>(this.urlService.URLS.PROJECT_IMPLEMENTATION + '/template/validate', {
      context: new HttpContext().set(NOT_RETRY_TOKEN, true),
      params: new HttpParams({
        fromObject: { templateId, ...caseId ? { caseId } : undefined, ...requestType ? { requestType } : undefined }
      })
    }).pipe(map(res => res.rs));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getInternalProjectImplementation(criteria: any): Observable<ProjectImplementation[]> {
    if (!criteria.country)
      return of([])
    return this.http.get<ProjectImplementation[]>(this._getURLSegment() + '/internal/implementation', {
      params: new HttpParams({ fromObject: criteria })
    });
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getExternalProjectImplementation(criteria: any): Observable<ProjectImplementation[]> {
    if (!criteria.country)
      return of([])
    return this.http.get<ProjectImplementation[]>(this._getURLSegment() + '/external/implementation', {
      params: new HttpParams({ fromObject: criteria })
    });
  }
}
