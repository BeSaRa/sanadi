import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {AidLookupService} from '../services/aid-lookup.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {Lookup} from './lookup';

export class AidLookup extends BaseModel<AidLookup> {
  aidCode!: string;
  category: number | undefined;
  status: boolean = true;
  statusDateModified: number | undefined;
  aidType: number | undefined;
  aidTypeInfo: Lookup | undefined;
  parent: number | undefined;
  parentInfo: any | undefined;

  private service: AidLookupService;
  private langService: LangService;

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

  save(): Observable<AidLookup> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<AidLookup> {
    return this.service.update(this);
  }

  toggleStatus(): AidLookup {
    this.status = !this.status;
    return this;
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
