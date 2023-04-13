import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CharityDecision } from '@app/models/charity-decision';

export class CharityDecisionInterceptor implements IModelInterceptor<CharityDecision>{
  caseInterceptor?: IModelInterceptor<CharityDecision> | undefined;
  send(model: Partial<CharityDecision>): Partial<CharityDecision> {
    delete model.service;
    delete model.langService;
    delete model.auditOperation;
    return model;
  }
  receive(model: CharityDecision): CharityDecision {
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate);
    return model;
  }
}
