import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentJointReliefCampaignSearchCriteria} from '@app/models/urgent-joint-relief-campaign-search-criteria';

export class UrgentJointReliefCampaignSearchCriteriaInterceptor implements IModelInterceptor<UrgentJointReliefCampaignSearchCriteria> {
    send(model: Partial<UrgentJointReliefCampaignSearchCriteria>): Partial<UrgentJointReliefCampaignSearchCriteria> {
        return model;
    }
    receive(model: UrgentJointReliefCampaignSearchCriteria): UrgentJointReliefCampaignSearchCriteria {
        return model;
    }
}
