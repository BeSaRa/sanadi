import {Team} from './team';
import {BaseModel} from './base-model';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {InternalDepartmentService} from '../services/internal-department.service';

export class InternalDepartment extends BaseModel<InternalDepartment, InternalDepartmentService> {
  service!: InternalDepartmentService;
  arName!: string;
  mainTeam!: Team;
  code!: string;
  createdBy!: any;
  createdOn!: any;
  email!: string;
  enName!: string;
  id!: number;
  ldapPrefix!: string;
  parent!: number;
  status!: number;
  statusDateModified!: any;
  type!: number;

  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }


}
