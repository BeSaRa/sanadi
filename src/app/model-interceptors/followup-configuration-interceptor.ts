import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { FollowupConfiguration } from "@app/models/followup-configuration";
import { Lookup } from "@app/models/lookup";

export class FollowupConfigurationInterceptor
  implements IModelInterceptor<FollowupConfiguration>
{
  send(model: Partial<FollowupConfiguration>): Partial<FollowupConfiguration> {
    delete model.followUpTypeInfo;
    delete model.requestTypeInfo;
    return model;
  }
  receive(model: FollowupConfiguration): FollowupConfiguration {
    model.followUpTypeInfo = (new Lookup()).clone(model.followUpTypeInfo);
    model.requestTypeInfo = (new Lookup()).clone(model.requestTypeInfo);
    return model;
  }
}
