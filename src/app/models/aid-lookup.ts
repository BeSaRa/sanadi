import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {AidLookupService} from '../services/aid-lookup.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {Lookup} from './lookup';
import {searchFunctionType} from '../types/types';

export class AidLookup extends BaseModel<AidLookup> {
  aidCode!: string;
  category: number | undefined;
  status: number | undefined;
  statusDateModified: number | undefined;
  aidType: number | undefined;
  aidTypeInfo: Lookup | undefined;
  parent: number | undefined;
  parentInfo: any | undefined;

  private service: AidLookupService;
  private langService: LangService;
  private statusInfo!: Lookup;
  statusDateModifiedString!: string;

  searchFields: { [key: string]: searchFunctionType | string } = {
    aidCode: 'aidCode',
    arName: 'arName',
    enName: 'enName',
    status: text => this.statusInfo?.getName().toLowerCase().indexOf(text) !== -1,
    statusModifiedDate: 'statusDateModifiedString'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('AidLookupService');
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<AidLookup> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<AidLookup> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<AidLookup> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
