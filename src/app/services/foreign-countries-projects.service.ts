import { HttpClient } from '@angular/common/http';
import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { ForeignCountriesProjectsResult } from '@app/models/foreign-countries-projects-results';
import { ForeignCountriesProjectsSearchCriteria } from '@app/models/foreign-countries-projects-seach-criteria';
import { ForeignCountriesProjectsComponent } from '@app/modules/general-services/pages/foreign-countries-projects/foreign-countries-projects.component';
import { ForeignCountriesProjectsPopupComponent } from '@app/modules/general-services/popups/foreign-countries-projects-popup/foreign-countries-projects-popup.component';
import { Observable } from 'rxjs';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { LicenseService } from './license.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => ForeignCountriesProjects,
    shape: {},
  },
})
@Injectable({
  providedIn: 'root',
})
export class ForeignCountriesProjectsService extends BaseGenericEService<ForeignCountriesProjects> {
  jsonSearchFile = 'foreign_countries_projects.json';
  serviceKey: keyof ILanguageKeys =
    'menu_request_to_approve_projects_for_foreign_countries';
  caseStatusIconMap!: Map<number, string>;
  searchColumns: string[] = [
    'fullSerial',
    'caseStatus',
    'creatorInfo',
    'createdOn',
    'subject',
  ];
  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService,
    private urlService: UrlService,
    private license: LicenseService
  ) {
    super();
    FactoryService.registerService(ForeignCountriesProjectsService.name, this);
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.FOREIGN_COUNTRIES_PROJECTS;
  }
  _getModel(): typeof ForeignCountriesProjects {
    return ForeignCountriesProjects;
  }
  getSearchCriteriaModel<
    S extends ForeignCountriesProjects
  >(): ForeignCountriesProjects {
    return new ForeignCountriesProjectsSearchCriteria();
  }
  getCaseComponentName(): string {
    return ForeignCountriesProjectsComponent.name;
  }
  _getUrlService(): UrlService {
    return this.urlService;
  }
  licenseSearch(
    criteria: Partial<ForeignCountriesProjectsSearchCriteria> = {}
  ): Observable<ForeignCountriesProjectsResult[]> {
    return this.license.foreignCountriesProjectsSearch(criteria);
  }
  approveTask(model: ForeignCountriesProjects, action: WFResponseType) {
    return this.dialog.show(ForeignCountriesProjectsPopupComponent, {
      model,
      action
    });
  }
}
