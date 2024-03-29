import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {FundraisingInterceptor} from '@app/model-interceptors/fundraising-interceptor';
import {Fundraising} from '@app/models/fundraising';
import {FundraisingSearchCriteria} from '@app/models/FundRaisingSearchCriteria';
import {Observable} from 'rxjs';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {FactoryService} from './factory.service';
import {LicenseService} from './license.service';
import {UrlService} from './url.service';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {CastResponseContainer} from '@decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => Fundraising
  }
})
@Injectable({
  providedIn: 'root',
})
export class FundraisingService extends BaseGenericEService<Fundraising> {
  jsonSearchFile: string = 'fundraising_search.json';
  interceptor: IModelInterceptor<Fundraising> = new FundraisingInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_fundraising';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'creatorInfo', 'caseStatus', 'createdOn'];
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'actions'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    private urlService: UrlService,
    private licenseService: LicenseService
  ) {
    super();
    FactoryService.registerService('FundraisingService', this);
  }

  _getModel() {
    return Fundraising;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.FUNDRAISING;
  }

  _getInterceptor(): Partial<IModelInterceptor<Fundraising>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends Fundraising>(): Fundraising {
    return new FundraisingSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'FundraisingComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  licenseSearch(criteria: Partial<FundraisingSearchCriteria> = {}): Observable<Fundraising[]> {
    return this.licenseService.fundRaisingLicenseSearch(criteria);
  }
}
