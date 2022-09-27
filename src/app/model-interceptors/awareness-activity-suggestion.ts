import { AwarenessActivitySuggestion } from './../models/awareness-activity-suggestion';
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class AwarenessActivitySuggestionInterceptor implements IModelInterceptor<AwarenessActivitySuggestion> {
  receive(model: AwarenessActivitySuggestion): AwarenessActivitySuggestion {

    return model;
  }

  send(model: any) {

    AwarenessActivitySuggestionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: any) {
    delete model.requestTypeInfo;
    delete model.searchFields;
  }
}
