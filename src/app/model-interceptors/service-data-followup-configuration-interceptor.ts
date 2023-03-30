import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ServiceDataFollowupConfiguration } from "@models/service-data-followup-configuration";
import { Lookup } from "@app/models/lookup";
import { Team } from '@app/models/team';

export class ServiceDataFollowupConfigurationInterceptor
  implements IModelInterceptor<ServiceDataFollowupConfiguration>
{
  send(model: Partial<ServiceDataFollowupConfiguration>): Partial<ServiceDataFollowupConfiguration> {
    delete model.followUpTypeInfo;
    delete model.requestTypeInfo;
    delete model.responsibleTeamInfo;
    delete model.concernedTeamInfo;
    return model;
  }
  receive(model: ServiceDataFollowupConfiguration): ServiceDataFollowupConfiguration {
    model.followUpTypeInfo = (new Lookup()).clone(model.followUpTypeInfo);
    model.requestTypeInfo = (new Lookup()).clone(model.requestTypeInfo);
    model.responsibleTeamInfo = (new Team()).clone(model.responsibleTeamInfo);
    model.concernedTeamInfo = (new Team()).clone(model.concernedTeamInfo);
    return model;
  }
}
