import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';

export class AdminResult {
  id?: number;
  arName = '';
  enName = '';
  parent?: number;

  private langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }


  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
