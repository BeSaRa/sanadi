import { isValidAdminResult } from '@helpers/utils';
import { AdminResult } from './../models/admin-result';
import { DateUtils } from './../helpers/date-utils';
import { AwarenessActivitySuggestion } from './../models/awareness-activity-suggestion';
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class AwarenessActivitySuggestionInterceptor implements IModelInterceptor<AwarenessActivitySuggestion> {
  receive(model: AwarenessActivitySuggestion): AwarenessActivitySuggestion {

    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.expectedDate = DateUtils.changeDateToDatepicker(model.expectedDate);
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);
    model.agreementWithRACA = model.agreementWithRACA ? 1 : 2;
    model.expectedDateTimeStamp = !model.expectedDate ? null : DateUtils.getTimeStampFromDate(model.expectedDate);

    return model;
  }

  send(model: any) {
    (model.expectedDate && (model.expectedDate = DateUtils.getDateStringFromDate(model.expectedDate)));
    (model.followUpDate && (model.followUpDate = DateUtils.getDateStringFromDate(model.followUpDate)));
    model.agreementWithRACA = (model.agreementWithRACA == 1)
    AwarenessActivitySuggestionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: any) {
    delete model.requestTypeInfo;
    delete model.licenseStatusInfo;
    delete model.searchFields;
  }
}
