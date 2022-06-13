import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentJointReliefCampaignSearchCriteria} from '@app/models/urgent-joint-relief-campaign-search-criteria';
import { UrgentJointReliefCampaignInterceptor } from "@app/model-interceptors/urgent-joint-relief-campaign-interceptor";

export class UrgentJointReliefCampaignSearchCriteriaInterceptor implements IModelInterceptor<UrgentJointReliefCampaignSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new UrgentJointReliefCampaignInterceptor()
    send(model: Partial<UrgentJointReliefCampaignSearchCriteria>): Partial<UrgentJointReliefCampaignSearchCriteria> {
        return model;
    }
    receive(model: UrgentJointReliefCampaignSearchCriteria): UrgentJointReliefCampaignSearchCriteria {
        return model;
    }
}
