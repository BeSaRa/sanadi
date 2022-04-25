import {INames} from '@app/interfaces/i-names';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class NpoEmployee extends SearchableCloneable<NpoEmployee>{
  orgId!: number;
  getqId!: number;
  arName!: string;
  enName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  country!: number;
  status!: number;
  statusDateModified!: string;
  id!: number;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
}
