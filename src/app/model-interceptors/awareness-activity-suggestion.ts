import { isValidAdminResult } from '@helpers/utils';
import { AdminResult } from './../models/admin-result';
import { DateUtils } from './../helpers/date-utils';
import { AwarenessActivitySuggestion } from './../models/awareness-activity-suggestion';
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class AwarenessActivitySuggestionInterceptor implements IModelInterceptor<AwarenessActivitySuggestion> {
  receive(model: AwarenessActivitySuggestion): AwarenessActivitySuggestion {

    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.activityTypeInfo = AdminResult.createInstance(isValidAdminResult(model.activityTypeInfo) ? model.activityTypeInfo : {});
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    return model;
  }

  send(model: AwarenessActivitySuggestion) {
    (model.followUpDate && (model.followUpDate = DateUtils.getDateStringFromDate(model.followUpDate)));
    AwarenessActivitySuggestionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<AwarenessActivitySuggestion>) {
    delete model.requestTypeInfo;
    delete model.licenseStatusInfo;
    delete model.activityTypeInfo;
    delete model.searchFields;
  }
}
