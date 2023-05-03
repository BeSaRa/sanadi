import { DateUtils } from '@app/helpers/date-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { isValidAdminResult } from '@app/helpers/utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CharityDecision } from '@app/models/charity-decision';

export class CharityDecisionInterceptor implements IModelInterceptor<CharityDecision>{
  caseInterceptor?: IModelInterceptor<CharityDecision> | undefined;
  send(model: Partial<CharityDecision>): Partial<CharityDecision> {
    delete model.service;
    delete model.langService;
    delete model.auditOperation;
    delete model.categoryInfo;
    delete model.generalDateStamp;
    return model;
  }
  receive(model: CharityDecision): CharityDecision {
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate);
    model.categoryInfo = AdminResult.createInstance(isValidAdminResult(model.categoryInfo)? model.categoryInfo : {});
    model.generalDateStamp = !model.generalDate ? null : DateUtils.getTimeStampFromDate(model.generalDate);
    return model;
  }
}
