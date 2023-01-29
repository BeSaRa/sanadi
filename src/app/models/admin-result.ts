import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class AdminResult {
  id?: number;
  arName = '';
  enName = '';
  parent?: number;
  lookupKey?: number;
  status?: number; // used when changing lookup/database record to admin-result
  fnId?: string;
  disabled?: boolean; // used when changing lookup/database record to admin-result and bind to disabled property for dropdown

  protected langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }


  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  }

  static createInstance(model: Partial<AdminResult>): AdminResult {
    return Object.assign(new AdminResult, model);
  }
}
