import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import {FollowupComment} from '@app/models/followup-comment';
import {Lookup} from '@app/models/lookup';


export class FollowupCommentInterceptor
  implements IModelInterceptor<FollowupComment>
{
  receive(model: FollowupComment): FollowupComment {
    model.generalUseInfo= (new Lookup()).clone(model.generalUseInfo);
    return model;
  }

  send(model: Partial<FollowupComment>): Partial<FollowupComment> {
    delete model.generalUseInfo;
    return model;
  }
}
