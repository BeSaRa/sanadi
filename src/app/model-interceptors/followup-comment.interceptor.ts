import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import {FollowupComment} from '@app/models/followup-comment';


export class FollowupCommentInterceptor
  implements IModelInterceptor<FollowupComment>
{
  receive(model: FollowupComment): FollowupComment {
    return model;
  }

  send(model: Partial<FollowupComment>): Partial<FollowupComment> {
    return model;
  }
}
