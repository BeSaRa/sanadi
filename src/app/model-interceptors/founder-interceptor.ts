import { IMyDateModel } from 'angular-mydatepicker';
import { DateUtils } from './../helpers/date-utils';
import { AdminResult } from './../models/admin-result';
import { FounderMembers } from '@app/models/founder-members';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

export class FounderInterceptor implements IModelInterceptor<FounderMembers> {
  send(model: Partial<FounderMembers>): Partial<FounderMembers> {
    model.joinDate = !model.joinDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.joinDate as unknown as IMyDateModel
      )?.toISOString();
    delete model.jobTitleInfo;
    delete model.nationalityInfo;
    delete model.searchFields
    return model;
  }

  receive(model: FounderMembers): FounderMembers {
    model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
    model.jobTitleInfo && (model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo));
    model.joinDate = DateUtils.changeDateToDatepicker(model.joinDate);
    return model;
  }
}
