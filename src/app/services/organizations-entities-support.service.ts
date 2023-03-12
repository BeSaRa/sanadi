import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {
  OrganizationsEntitiesSupportInterceptor
} from '@app/model-interceptors/organizations-entities-support-interceptor';
import {OrganizationsEntitiesSupport} from '@app/models/organizations-entities-support';
import {OrganizationsEntitiesSupportSearchCriteria} from '@app/models/organizations-entities-support-search-criteria';
import {
  OrganizationsEntitiesSupportPopupComponent
} from '@app/modules/services/organization-entities-support/popups/organizations-entities-support-popup/organizations-entities-support-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {FactoryService} from './factory.service';
import {LicenseService} from './license.service';
import {UrlService} from './url.service';

@CastResponseContainer({
  $default: {
    model: () => OrganizationsEntitiesSupport,
  },
})
@Injectable({
  providedIn: 'root',
})
export class OrganizationsEntitiesSupportService extends BaseGenericEService<OrganizationsEntitiesSupport> {
  constructor(
    private urlService: UrlService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    public dialog: DialogService,
    private licenseService: LicenseService,
    public http: HttpClient
  ) {
    super();
    FactoryService.registerService('OrganizationsEntitiesSupportService', this);
  }

  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject','goal', 'createdOn', 'caseStatus', 'ouInfo', 'creatorInfo'];
  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = [ 'licenseNumber','subject','goal', 'status', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_organizations_entities_support';
  jsonSearchFile: string = 'organizations_entities_support.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<OrganizationsEntitiesSupport> =
    new OrganizationsEntitiesSupportInterceptor();

  _getInterceptor(): Partial<IModelInterceptor<OrganizationsEntitiesSupport>> {
    return this.interceptor;
  }

  _getModel(): any {
    return OrganizationsEntitiesSupport;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.ORGANIZATION_ENTITIES_SUPPORT;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'OrganizationsEntitiesSupportComponent';
  }

  getSearchCriteriaModel<
    S extends OrganizationsEntitiesSupport
  >(): OrganizationsEntitiesSupport {
    return new OrganizationsEntitiesSupportSearchCriteria();
  }
  licenseSearch(
    criteria: Partial<OrganizationsEntitiesSupportSearchCriteria> = {}
  ): Observable<OrganizationsEntitiesSupport[]> {
    return this.licenseService.organizationsEntitiesSupportSearch(criteria);
  }
  approve(model: OrganizationsEntitiesSupport, action: WFResponseType): DialogRef {
    return this.dialog.show(OrganizationsEntitiesSupportPopupComponent, {
      model,
      action
    });
  }
  finalApprove(model: OrganizationsEntitiesSupport, action: WFResponseType): DialogRef {
    return this.dialog.show(OrganizationsEntitiesSupportPopupComponent, {
      model,
      action
    });
  }
}
