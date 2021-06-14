import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {UserTypes} from '../enums/user-types.enum';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';

export class InternalUser extends BaseModel<InternalUser, any> {
  service: any;
  id!: number;
  arName!: string;
  enName!: string;
  defaultDepartmentId!: number;
  domainName!: string;
  email!: string;
  empNum!: string;
  jobTitle!: number;
  officialPhoneNumber!: string;
  phoneExtension!: string;
  phoneNumber!: string;
  status!: number;
  statusDateModified!: string;
  userType!: UserTypes;

  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<InternalUser> {
    throw new Error('Method not implemented.');
  }

  delete(): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  save(): Observable<InternalUser> {
    throw new Error('Method not implemented.');
  }

  update(): Observable<InternalUser> {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
