import { DateUtils } from './../helpers/date-utils';
import { AwarenessActivitySuggestion } from './../models/awareness-activity-suggestion';
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class AwarenessActivitySuggestionInterceptor implements IModelInterceptor<AwarenessActivitySuggestion> {
  receive(model: AwarenessActivitySuggestion): AwarenessActivitySuggestion {

    model.expectedDate = DateUtils.changeDateToDatepicker(model.expectedDate);
    model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    return model;
  }

  send(model: any) {
    (model.expectedDate && (model.expectedDate = DateUtils.getDateStringFromDate(model.expectedDate)));
    (model.followUpDate && (model.followUpDate = DateUtils.getDateStringFromDate(model.followUpDate)));
    AwarenessActivitySuggestionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: any) {
    delete model.requestTypeInfo;
    delete model.searchFields;
  }
}
