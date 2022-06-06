import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {UrgentJointReliefCampaignInterceptor} from '@app/model-interceptors/urgent-joint-relief-campaign-interceptor';
import {UrgentJointReliefCampaignCriteria} from '@app/models/urgent-joint-relief-campaign-criteria';
import {FactoryService} from '@services/factory.service';
import {CastResponseContainer} from '@decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => UrgentJointReliefCampaign
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentJointReliefCampaignService extends BaseGenericEService<UrgentJointReliefCampaign> {
  jsonSearchFile: string = '';
  interceptor: IModelInterceptor<UrgentJointReliefCampaign> = new UrgentJointReliefCampaignInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_urgent_joint_relief_campaign';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [''];

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentJointReliefCampaignService', this);
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_JOINT_RELIEF_CAMPAIGN;
  }

  _getModel() {
    return UrgentJointReliefCampaign;
  }

  _getInterceptor(): Partial<IModelInterceptor<UrgentJointReliefCampaign>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends UrgentJointReliefCampaign>(): UrgentJointReliefCampaign {
    return new UrgentJointReliefCampaignCriteria();
  }

  getCaseComponentName(): string {
    return 'UrgentJointReliefCampaignComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

}
