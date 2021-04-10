import {Team} from './team';
import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';

export class InternalDepartment extends BaseModel<InternalDepartment> {
  arName!: string;
  bawRole!: Team;
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

  create(): Observable<InternalDepartment> {
    throw new Error('Method not implemented.');
  }

  delete(): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  save(): Observable<InternalDepartment> {
    throw new Error('Method not implemented.');
  }

  update(): Observable<InternalDepartment> {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }




}
