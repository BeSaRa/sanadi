import {BaseModel} from './base-model';
import {LookupCategories} from '../enums/lookup-categories';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';

export class Lookup extends BaseModel<Lookup> {
  category!: LookupCategories;
  lookupKey!: number;
  lookupStrKey: string | undefined;
  status: number | undefined;
  itemOrder: number | undefined;
  parent: number | undefined;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<Lookup> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<Lookup> {
    throw new Error('No Impl');
  }

  update(): Observable<Lookup> {
    throw new Error('No Impl');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  setValues(arName: string, enName: string, lookupKey: number, id: number): Lookup {
    this.arName = arName;
    this.enName = enName;
    this.lookupKey = lookupKey;
    this.id = id;
    return this;
  }
}
