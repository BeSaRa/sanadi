import {BaseModel} from '@app/models/base-model';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';
import {INames} from '@app/interfaces/i-names';
import {FollowupCommentService} from '@app/services/followup-comment.service';

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

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
