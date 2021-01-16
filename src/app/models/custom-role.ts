import {BaseModel} from './base-model';
import {Permission} from './permission';
import {CustomRoleService} from '../services/custom-role.service';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';

export class CustomRole extends BaseModel<CustomRole> {
  status: boolean = true;
  permissions: Permission[] = [];
  description: string = '';
  service: CustomRoleService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('CustomRoleService');
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<CustomRole> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<CustomRole> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<CustomRole> {
    return this.service.update(this);
  }

  toggleStatus(): CustomRole {
    this.status = !this.status;
    return this;
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
