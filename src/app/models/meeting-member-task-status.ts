import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {INames} from '@contracts/i-names';
import {InterceptModel} from '@decorators/intercept-model';
import {MeetingMemberTaskStatusInterceptor} from '@app/model-interceptors/meeting-member-task-status-interceptor';

const interceptor = new MeetingMemberTaskStatusInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class MeetingMemberTaskStatus extends SearchableCloneable<MeetingMemberTaskStatus>{
  tkiid!: string;
  name!: string;
  pId!: string;
  type!: string;
  arName!: string;
  enName!: string;
  organizationId!: string;

  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName() {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
}
