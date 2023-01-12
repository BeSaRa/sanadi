import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ProjectImplementation} from "@app/models/project-implementation";
import {CastResponseContainer} from "@decorators/cast-response";
import {FactoryService} from "@services/factory.service";
import {DialogService} from '@services/dialog.service';
import {DynamicOptionsService} from '@services/dynamic-options.service';
import {UrlService} from '@services/url.service';
import {ProjectImplementationApproveTaskPopupComponent} from "@modules/projects/popups/project-implementation-approve-task-popup/project-implementation-approve-task-popup.component";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
@CastResponseContainer({
  $default: {
    model: () => ProjectImplementation
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
    public domSanitizer: DomSanitizer,
    private urlService: UrlService
  ) {
    super();
    FactoryService.registerService('ProjectImplementationService', this)
  }

  _getURLSegment(): string {
    return this.urlService.URLS.PROJECT_IMPLEMENTATION
  }

  _getModel() {
    return ProjectImplementation
  }

  getSearchCriteriaModel<S extends ProjectImplementation>(): ProjectImplementation {
    return new ProjectImplementation()
  }

  getCaseComponentName(): string {
    return 'ProjectImplementationComponent'
  }

  _getUrlService(): UrlService {
    return this.urlService
  }
  approveTask(model: ProjectImplementation, action: WFResponseType) {
    return this.dialog.show(ProjectImplementationApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
