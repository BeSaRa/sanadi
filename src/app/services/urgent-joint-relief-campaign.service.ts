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
import {UrgentJointReliefCampaignSearchCriteria} from '@app/models/urgent-joint-relief-campaign-search-criteria';
import {FactoryService} from '@services/factory.service';
import {CastResponseContainer} from '@decorators/cast-response';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  UrgentJointReliefCampaignInitialApproveTaskPopupComponent
} from '@app/projects/popups/urgent-joint-relief-campaign-initial-approve-task-popup/urgent-joint-relief-campaign-initial-approve-task-popup.component';
import {
  UrgentJointReliefCampaignFinalApproveTaskPopupComponent
} from '@app/projects/popups/urgent-joint-relief-campaign-final-approve-task-popup/urgent-joint-relief-campaign-final-approve-task-popup.component';
import {
  UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent
} from '@app/projects/popups/urgent-joint-relief-campaign-organization-approve-task-popup/urgent-joint-relief-campaign-organization-approve-task-popup.component';
import {InboxService} from '@services/inbox.service';
import {FormGroup} from '@angular/forms';
import {OrganizationOfficer} from '@app/models/organization-officer';

@CastResponseContainer({
  $default: {
    model: () => UrgentJointReliefCampaign
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentJointReliefCampaignService extends BaseGenericEService<UrgentJointReliefCampaign> {
  jsonSearchFile: string = 'urgent_joint_relief_campaign_search.json';
  interceptor: IModelInterceptor<UrgentJointReliefCampaign> = new UrgentJointReliefCampaignInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_urgent_joint_relief_campaign';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'fullName', 'subject', 'caseStatus', 'creatorInfo', 'createdOn'];

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
    return new UrgentJointReliefCampaignSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'UrgentJointReliefCampaignComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  initialApproveTask(model: UrgentJointReliefCampaign, action: WFResponseType): DialogRef {
    return this.dialog.show(UrgentJointReliefCampaignInitialApproveTaskPopupComponent, {
      model,
      action: action
    });
  }

  validateApproveTask(model: UrgentJointReliefCampaign, action: WFResponseType): DialogRef {
    return this.dialog.show(UrgentJointReliefCampaignInitialApproveTaskPopupComponent, {
      model,
      action: action
    });
  }

  organizationApproveTask(taskId: string, caseType: number, actionType: WFResponseType, claimBefore: boolean = false, model?: UrgentJointReliefCampaign, externalUserData?: {form: FormGroup, organizationOfficers: OrganizationOfficer[]}): DialogRef {
    const inboxService = FactoryService.getService('InboxService') as InboxService;
    return this.dialog.show(UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent, {
      service: this,
      inboxService: inboxService,
      taskId,
      actionType,
      claimBefore,
      model,
      externalUserData
    });
  }

  finalApproveTask(model: UrgentJointReliefCampaign, action: WFResponseType): DialogRef {
    return this.dialog.show(UrgentJointReliefCampaignFinalApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
