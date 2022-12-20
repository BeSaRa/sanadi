import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {FactoryService} from "@services/factory.service";
import {CastResponse, CastResponseContainer} from "@decorators/cast-response";
import {Observable, of} from "rxjs";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {ProjectModel} from "@app/models/project-model";
import {map, switchMap} from "rxjs/operators";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ChooseTemplatePopupComponent} from "@app/projects/popups/choose-template-popup/choose-template-popup.component";
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {DeductionRatioItemService} from "@services/deduction-ratio-item.service";
import {SharedService} from "@services/shared.service";
import {ProjectTemplate} from "@app/models/projectTemplate";
import {ProjectModelService} from "@services/project-model.service";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {
  ProjectFundraisingApproveTaskPopupComponent
} from "@app/projects/popups/project-fundraising-approve-task-popup/project-fundraising-approve-task-popup.component";
import {LicenseService} from "@services/license.service";

@CastResponseContainer({
  $default: {
    model: () => ProjectFundraising
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProjectFundraisingService extends BaseGenericEService<ProjectFundraising> {
  jsonSearchFile: string = 'project_fundraising_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_projects_fundraising';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'createdOn', 'caseStatus', 'ouInfo'];

  constructor(public http: HttpClient,
              public domSanitizer: DomSanitizer,
              private _deductionService: DeductionRatioItemService,
              public dialog: DialogService,
              private sharedService: SharedService,
              private projectModelService: ProjectModelService,
              private urlService: UrlService,
              private licenseService: LicenseService,
              public dynamicService: DynamicOptionsService) {
    super()
    FactoryService.registerService('ProjectFundraisingService', this)
  }

  _getURLSegment(): string {
    return this.urlService.URLS.PROJECT_FUNDRAISING
  }

  _getModel() {
    return ProjectFundraising
  }

  getSearchCriteriaModel<S extends ProjectFundraising>(): ProjectFundraising {
    return new ProjectFundraising();
  }

  getCaseComponentName(): string {
    return 'ProjectFundraisingComponent'
  }

  _getUrlService(): UrlService {
    return this.urlService
  }

  openDialogSearchTemplate(criteria: any, workArea: ProjectWorkArea, templateId?: string): Observable<DialogRef> {
    return this.searchForTemplate(criteria, workArea)
      // .pipe(map(items => items.map(item => item.normalizeTemplate())))
      .pipe(switchMap(templates => templates.length ? of(this.dialog.show(ChooseTemplatePopupComponent, {
        templates,
        templateId,
        workArea
      })) : of(this.dialog.info('there is no templates'))))
  }

  @CastResponse(() => ProjectModel)
  private searchForTemplate(criteria: any, workAreType: ProjectWorkArea): Observable<ProjectModel[]> {
    return this.http.get<ProjectModel[]>(this.urlService.URLS.PROJECT_MODELING + '/' + (workAreType === ProjectWorkArea.OUTSIDE_QATAR ? 'external' : 'internal') + '/template/criteria', {
      params: new HttpParams({fromObject: criteria})
    })
  }

  @CastResponse(() => DeductionRatioItem)
  public loadDeductionRatio(criteria: { permitType: number, workArea: number }): Observable<DeductionRatioItem[]> {
    return this.http.get<DeductionRatioItem[]>(this.urlService.URLS.DEDUCTION_RATIO_ITEM, {
      params: new HttpParams({fromObject: criteria})
    })
  }

  viewTemplate(template: ProjectTemplate): Observable<DialogRef> {
    return this.projectModelService.exportTemplate(template.templateId)
      .pipe(map((blob) => {
        return this.sharedService.openViewContentDialog(blob, {documentTitle: template.templateFullSerial}) as DialogRef
      }))
  }

  approveTask(model: ProjectFundraising, action: WFResponseType) {
    return this.dialog.show(ProjectFundraisingApproveTaskPopupComponent, {
      model,
      action: action
    });
  }

  licenseSearch(criteria: Partial<ProjectFundraising>): Observable<ProjectFundraising[]> {
    return this.licenseService.projectFundraisingLicenseSearch(criteria);
  }
}
