import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class MeetingPointMemberComment extends SearchableCloneable<MeetingPointMemberComment>{
  arName!: string;
  comment!: string;
  enName!: string;
  private langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
}
