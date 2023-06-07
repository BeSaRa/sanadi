import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ProjectModel } from "@app/models/project-model";
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from "@app/services/factory.service";
import { UrlService } from "@app/services/url.service";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";
import { ProjectCompletion } from '@app/models/project-completion';
import { ProjectCompletionInterceptor } from '@app/model-interceptors/project-completion-interceptor';
import { ProjectCompletionSearchCriteria } from '@app/models/project-completion-search-criteria';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ProjectCompletionApprovalFormComponent } from '@app/modules/services/project-completion/popups/project-completion-approval-form/project-completion-approval-form.component';

@CastResponseContainer({
  $default: {
    model: () => ProjectCompletion
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProjectCompletionService extends BaseGenericEService<ProjectCompletion> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  jsonSearchFile: string = 'project_completion_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_project_completion';
  interceptor: IModelInterceptor<ProjectCompletion> = new ProjectCompletionInterceptor();
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'subject', 'caseStatus', 'createdOn', 'ouInfo'];

  _getModel() {
    return ProjectCompletion;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.PROJECT_COMPLETION;
  }

  _getInterceptor(): Partial<IModelInterceptor<ProjectCompletion>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends ProjectCompletion>(): ProjectCompletion {
    return new ProjectCompletionSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'ProjectCompletionComponent';
  }

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('ProjectCompletionService', this);
  }

  approve(model: ProjectCompletion, action: WFResponseType): DialogRef {
    return this.dialog.show(ProjectCompletionApprovalFormComponent, {
      model,
      action
    });
  }
}
