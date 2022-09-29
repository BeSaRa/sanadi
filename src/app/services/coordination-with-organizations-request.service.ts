import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IReturnToOrganizationService} from '@app/interfaces/i-return-to-organization-service-interface';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {CoordinationWithOrganizationsRequest} from '@app/models/coordination-with-organizations-request';
import {OrgUnit} from '@app/models/org-unit';
import {ValidOrgUnit} from '@app/models/valid-org-unit';
import {
  ParticipantOrganizationsPopupComponent
} from '@app/modules/e-services-main/popups/participant-organizations-popup/participant-organizations-popup.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CoordinationWithOrganizationsRequestSearchCriteria} from './../models/coordination-with-organizations-request-search-criteria';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {FactoryService} from './factory.service';
import {LangService} from './lang.service';
import {SearchService} from './search.service';
import {UrlService} from './url.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  CoordinationWithOrgPopupComponent
} from '@app/modules/general-services/popups/coordination-with-org-popup/coordination-with-org-popup.component';
import {InboxService} from './inbox.service';
import {UntypedFormGroup} from '@angular/forms';
import {OrganizationOfficer} from '@app/models/organization-officer';

@CastResponseContainer({
  $default: {
    model: () => CoordinationWithOrganizationsRequest,
  },
})
@Injectable({
  providedIn: 'root',
})
export class CoordinationWithOrganizationsRequestService
  extends BaseGenericEService<CoordinationWithOrganizationsRequest>
  implements IReturnToOrganizationService {
  jsonSearchFile: string =
    'coordination_with_organizations_request_search.json';
  serviceKey: keyof ILanguageKeys =
    'menu_coordination_with_organizations_request';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchService: SearchService = new SearchService(this);
  searchColumns: string[] = [
    'fullSerial',
    'fullName',
    'domainInfo',
    'caseStatus',
    'createdOn',
  ];

  constructor(
    public domSanitizer: DomSanitizer,
    public lang: LangService,
    public http: HttpClient,
    public dynamicService: DynamicOptionsService,
    public cfr: ComponentFactoryResolver,
    private urlService: UrlService,
    public dialog: DialogService
  ) {
    super();
    FactoryService.registerService(
      'CoordinationWithOrganizationsRequestService',
      this
    );
  }

  set setOrgUsers(value: OrganizationOfficer[]) {
    this._orgUsers = value;
  }

  private _orgUsers: OrganizationOfficer[] = [];

  get orgUsers() {
    return this._orgUsers;
  }

  private _mainModel!: CoordinationWithOrganizationsRequest;

  get mainModel() {
    return this._mainModel;
  }

  set mainModel(value: CoordinationWithOrganizationsRequest) {
    this._mainModel = value;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.E_COORDINATION_WITH_ORGANIZATION_REQUEST;
  }

  _getModel() {
    return CoordinationWithOrganizationsRequest;
  }

  getSearchCriteriaModel<S extends CoordinationWithOrganizationsRequest>(): CoordinationWithOrganizationsRequest {
    return new CoordinationWithOrganizationsRequestSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'CoordinationWithOrganizationsRequest';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  prepareModelBeforeSave(model: CoordinationWithOrganizationsRequest) {
    if (this.mainModel) {
      model.organizaionOfficerList =
        model.organizaionOfficerList.concat(
          this.mainModel.organizaionOfficerList
        );
      model.buildingAbilitiesList =
        model.buildingAbilitiesList.concat(
          this.mainModel.buildingAbilitiesList
        );
      model.effectiveCoordinationCapabilities =
        model.effectiveCoordinationCapabilities.concat(
          this.mainModel.effectiveCoordinationCapabilities
        );
      model.researchAndStudies = model.researchAndStudies.concat(
        this.mainModel.researchAndStudies
      );
    }
    return model;
  }

  openParticipantOrganizationspopup(
    orgId: number,
    model: CoordinationWithOrganizationsRequest
  ) {
    this.dialog.show(
      ParticipantOrganizationsPopupComponent,
      {
        service: this,
        orgId,
        model,
      },
      {fullscreen: true}
    );
  }

  returnToOrganization(caseId: number, orgId: number): Observable<OrgUnit[]> {
    return this.http
      .get<IDefaultResponse<OrgUnit[]>>(
        this._getURLSegment() + '/task/' + caseId + '/' + orgId
      )
      .pipe(map((response) => response.rs));
  }

  getToReturnValidOrganizations(caseId: number): Observable<ValidOrgUnit[]> {
    return this.http
      .get<IDefaultResponse<ValidOrgUnit[]>>(
        this._getURLSegment() + '/valid/org/' + caseId
      )
      .pipe(
        map((response) => {
          return response.rs.map((x) => new ValidOrgUnit().clone(x));
        })
      );
  }
  organizationApprove(
    taskId: string,
    caseType: number,
    actionType: WFResponseType,
    claimBefore: boolean = false,
    model?: CoordinationWithOrganizationsRequest,
    externalUserData?: {
      form: UntypedFormGroup;
      organizationOfficers: OrganizationOfficer[];
    }
  ): DialogRef {
    const inboxService = FactoryService.getService(
      'InboxService'
    ) as InboxService;
    return this.dialog.show(CoordinationWithOrgPopupComponent, {
      service: this,
      actionType,
      model,
    });
  }


}
