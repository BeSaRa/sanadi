import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {LookupService} from '../services/lookup.service';
import {FactoryService} from '../services/factory.service';
import {OrganizationBranchService} from '../services/organization-branch.service';
import {Lookup} from './lookup';
import {LookupCategories} from '../enums/lookup-categories';
import {searchFunctionType} from '../types/types';
import {DialogRef} from '../shared/models/dialog-ref';

export class OrgBranch extends BaseModel<OrgBranch, OrganizationBranchService> {
  orgId: number | undefined;
  phoneNumber1: string | undefined;
  phoneNumber2: string | undefined;
  email: string | undefined;
  zone: string | undefined;
  street: string | undefined;
  buildingName: string | undefined;
  unitName: string | undefined;
  address: string | undefined;
  status: string | undefined;
  isMain: boolean = false;
  statusDateModified: string | undefined;

  service: OrganizationBranchService;
  langService: LangService;
  lookupService: LookupService;
  statusDateModifiedString!: string;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    phoneNumber1: 'phoneNumber1',
    address: 'address',
    statusModifiedDate: 'statusDateModifiedString',
    status: text => this.getOrgStatusLookup()?.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationBranchService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  create(): Observable<OrgBranch> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<OrgBranch> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<OrgBranch> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getOrgStatusLookup(): Lookup | null {
    // @ts-ignore
    return this.lookupService.getByLookupKeyAndCategory(this.status, LookupCategories.ORG_STATUS);
  }

  showAuditLogs($event: MouseEvent): Observable<DialogRef> {
    return this.service.openAuditLogsById(this.id);
  }
}
