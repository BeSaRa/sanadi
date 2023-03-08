import { ForeignCountriesProjectsApprovalPopupComponent } from '../modules/services/foreign-countries-projects/popups/foreign-countries-projects-approval-popup/foreign-countries-projects-approval-popup.component';
import { DialogRef } from './../shared/models/dialog-ref';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { HttpClient } from '@angular/common/http';
import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { ForeignCountriesProjectsResult } from '@app/models/foreign-countries-projects-results';
import { ForeignCountriesProjectsSearchCriteria } from '@app/models/foreign-countries-projects-seach-criteria';
import { Observable } from 'rxjs';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { FollowupDateService } from './follow-up-date.service';
import { LicenseService } from './license.service';
import { UrlService } from './url.service';
import { ForeignCountriesProjectsNeed } from '@app/models/foreign-countries-projects-need';

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
  serviceKey: keyof ILanguageKeys = 'menu_request_to_approve_projects_for_foreign_countries';
  caseStatusIconMap!: Map<number, string>;
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'caseStatus', 'creatorInfo', 'createdOn', 'subject'];

  constructor(
    // For complete the request with a follow up
    private _: FollowupDateService,
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService,
    private urlService: UrlService,
    private license: LicenseService
  ) {
    super();
    FactoryService.registerService('ForeignCountriesProjectsService', this);
  }

  _getURLSegment(): string {
    return this._getUrlService().URLS.FOREIGN_COUNTRIES_PROJECTS;
  }

  _getModel(): typeof ForeignCountriesProjects {
    return ForeignCountriesProjects;
  }

  getSearchCriteriaModel<S extends ForeignCountriesProjects>(): ForeignCountriesProjects {
    return new ForeignCountriesProjectsSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'ForeignCountriesProjectsComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  licenseSearch(
    criteria: Partial<ForeignCountriesProjectsSearchCriteria> = {}
  ): Observable<ForeignCountriesProjectsResult[]> {
    return this.license.foreignCountriesProjectsSearch(criteria);
  }

  @CastResponse(() => ForeignCountriesProjectsNeed)
  loadForeignCountriesProjectsNeeds(countryId: number): Observable<ForeignCountriesProjectsNeed[]> {
    return this.http.get<ForeignCountriesProjectsNeed[]>(this._getURLSegment() + '/needs/country/' + countryId);
  }

  public finalApproveTask(model: ForeignCountriesProjects, action: WFResponseType): DialogRef {
    return this.dialog.show(ForeignCountriesProjectsApprovalPopupComponent, {
      model,
      action
    });
  }
}
