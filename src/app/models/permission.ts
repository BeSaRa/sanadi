import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';

export class Permission extends BaseModel<Permission, any> {
  service: any;
  permissionKey!: string;
  description: string | undefined;
  groupId!: number;
  status: boolean | undefined;
  private langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<Permission> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<Permission> {
    throw new Error('No Impl');
  }

  update(): Observable<Permission> {
    throw new Error('No Impl');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
