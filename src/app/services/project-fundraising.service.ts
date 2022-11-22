import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ProjectFundraising } from "@app/models/project-fundraising";
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { FactoryService } from "@services/factory.service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => ProjectFundraising
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProjectFundraisingService extends BaseGenericEService<ProjectFundraising> {
  jsonSearchFile: string = '';
  serviceKey: keyof ILanguageKeys = 'menu_projects_fundraising';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];

  constructor(public http: HttpClient,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              private urlService: UrlService,
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
    throw new Error('Method not implemented.');
  }

  getCaseComponentName(): string {
    return 'ProjectFundraisingComponent'
  }

  _getUrlService(): UrlService {
    return this.urlService
  }
}
