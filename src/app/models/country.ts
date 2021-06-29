import {BaseModel} from './base-model';
import {CountryService} from '../services/country.service';
import {FactoryService} from '../services/factory.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';

export class Country extends BaseModel<Country, CountryService> {
  parentId?: number;
  riskLevel!: number;
  service: CountryService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('CountryService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
