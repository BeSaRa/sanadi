import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {INames} from '@app/interfaces/i-names';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';

export class Bank extends SearchableCloneable<Bank> {
  arName!: string;
  enName!: string;
  id!: number;
  status!: number;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
}
