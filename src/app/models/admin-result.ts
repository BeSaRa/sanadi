import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export class AdminResult {
  id?: number;
  arName = '';
  enName = '';
  parent?: number;
  lookupKey?: number;
  status?: number;

  private langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }


  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  static createInstance(model: Partial<AdminResult>): AdminResult {
    return Object.assign(new AdminResult, model);
  }
}
