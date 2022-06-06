import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';
import {DateUtils} from '@helpers/date-utils';

export class UrgentJointReliefCampaignInterceptor implements IModelInterceptor<UrgentJointReliefCampaign> {
  send(model: Partial<UrgentJointReliefCampaign>): Partial<UrgentJointReliefCampaign> {
    model.licenseStartDate = DateUtils.getDateStringFromDate(model.licenseStartDate);
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    return model;
  }

  receive(model: UrgentJointReliefCampaign): UrgentJointReliefCampaign {
    model.licenseStartDate = DateUtils.changeDateToDatepicker(model.licenseStartDate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    return model;
  }
}
