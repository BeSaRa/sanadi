import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { FollowupConfiguration } from "@app/models/followup-configuration";
import { Lookup } from "@app/models/lookup";
import { Team } from '@app/models/team';

export class FollowupConfigurationInterceptor
  implements IModelInterceptor<FollowupConfiguration>
{
  send(model: Partial<FollowupConfiguration>): Partial<FollowupConfiguration> {
    delete model.followUpTypeInfo;
    delete model.requestTypeInfo;
    delete model.responsibleTeamInfo;
    delete model.concernedTeamInfo;
    return model;
  }
  receive(model: FollowupConfiguration): FollowupConfiguration {
    model.followUpTypeInfo = (new Lookup()).clone(model.followUpTypeInfo);
    model.requestTypeInfo = (new Lookup()).clone(model.requestTypeInfo);
    model.responsibleTeamInfo = (new Team()).clone(model.responsibleTeamInfo);
    model.concernedTeamInfo = (new Team()).clone(model.concernedTeamInfo);
    return model;
  }
}
