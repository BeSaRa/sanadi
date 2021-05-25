import {Cloneable} from './cloneable';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';

export class Team extends Cloneable<Team> {
  arName!: string;
  enName!: string;
  authName!: string;
  autoClaim!: boolean;
  id!: number;
  isHidden!: boolean;
  ldapGroupName!: string;
  parentDeptId!: number;
  updatedBy!: number;

  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
