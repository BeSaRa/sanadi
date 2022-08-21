import { BaseModel } from '@app/models/base-model';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { FollowupCommentService } from '@app/services/followup-comment.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { Lookup } from '@app/models/lookup';
import { FollowupCommentInterceptor } from "@app/model-interceptors/followup-comment.interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new FollowupCommentInterceptor();

@InterceptModel({ send, receive })
export class FollowupComment extends BaseModel<FollowupComment, FollowupCommentService> {
  service: FollowupCommentService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('FollowupCommentService');
    this.langService = FactoryService.getService('LangService');
  }


  followUpId!: number;
  generalUseId!: number;
  comment!: string;
  commentType!: number;
  status!: number;
  statusDateModified!: string;
  generalUseInfo!: Lookup;

  public buildForm(controls: boolean = false): any {
    const { comment } = this;
    return {
      comment: controls ? [comment, [CustomValidators.required]] : comment
    }
  }
}
