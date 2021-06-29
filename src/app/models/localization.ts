import {BaseModel} from './base-model';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {Observable} from 'rxjs';
import {INames} from '../interfaces/i-names';
import {searchFunctionType} from '../types/types';
import {AdminResult} from './admin-result';

export class Localization extends BaseModel<Localization, LangService> {
  localizationKey: string | undefined;
  module: number = 0;
  service: LangService;
  adminResult!: AdminResult;
  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: text => {
      console.log(this, text);
      return this.arName.indexOf(text) !== -1;
    },
    enName: 'enName',
    localizationKey: 'localizationKey'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('LangService');
  }

  create(): Observable<Localization> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<Localization> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<Localization> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.service.map.lang + 'Name') as keyof INames];
  }
}
