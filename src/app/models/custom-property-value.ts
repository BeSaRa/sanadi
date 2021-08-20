import {INames} from '../interfaces/i-names';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';

export class CustomPropertyValue {
  langService: LangService;
  constructor() {
    this.langService = FactoryService.getService('LangService');
  }
  id!: number;
  category!: number;
  arName: string = '';
  enName: string = '';
  lookupKey!: number;
  lookupStrKey: string = '';
  status!: boolean;
  itemOrder!: number;

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
