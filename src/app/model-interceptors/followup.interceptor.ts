import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { Followup } from "@app/models/followup";
import {Lookup} from '@app/models/lookup';
import {Team} from '@app/models/team';
import {FollowupConfiguration} from '@app/models/followup-configuration';


export class FollowupInterceptor
  implements IModelInterceptor<Followup>
{
  receive(model: Followup): Followup {
    model.followUpConfigrationInfo = (new Lookup()).clone(model.followUpTypeInfo)
    model.followUpTypeInfo = (new Lookup()).clone(model.followUpTypeInfo);
    model.serviceInfo = (new Lookup()).clone(model.serviceInfo);
    model.statusInfo= (new Lookup()).clone(model.statusInfo);
    model.orgInfo= (new Lookup()).clone(model.orgInfo);
    return model;
  }

  send(model: Partial<Followup>): Partial<Followup> {
    delete model.followUpConfigrationInfo;
    delete model.followUpTypeInfo;
    delete model.serviceInfo;
    delete model.statusInfo;
    delete model.orgInfo;
    return model;
  }
}
