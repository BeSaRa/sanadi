import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {OrganizationUserService} from '../services/organization-user.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';
import {AdminResult} from './admin-result';
import {Lookup} from './lookup';
import {LookupCategories} from '../enums/lookup-categories';
import {LookupService} from '../services/lookup.service';
import {searchFunctionType} from '../types/types';
import {DialogRef} from '../shared/models/dialog-ref';

export class OrgUser extends BaseModel<OrgUser, OrganizationUserService> {
  email: string | undefined;
  statusDateModified: number | undefined;
  orgId: number | undefined;
  orgBranchId: number | undefined;
  customRoleId: number | undefined;
  userType: number | undefined;
  qid: number | undefined;
  empNum: number | undefined;
  phoneNumber: string | undefined;
  officialPhoneNumber: string | undefined;
  phoneExtension: string | undefined;
  jobTitle: number | undefined;
  status: number | undefined;
  orgUnitInfo: AdminResult | undefined;
  orgBranchInfo: AdminResult | undefined;
  statusInfo: AdminResult | undefined; // need to bind to model
  userTypeInfo: AdminResult | undefined; // need to bind to model
  jobTitleInfo: AdminResult | undefined; // need to bind to model
  customRoleInfo: AdminResult | undefined;
  generalUserId!: number;

  service: OrganizationUserService;
  private langService: LangService;
  lookupService: LookupService;
  statusDateModifiedString!: string;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    empNum: 'empNum',
    domainName: 'domainName',
    organization: text => !this.orgUnitInfo ? false : this.orgUnitInfo.getName().toLowerCase().indexOf(text) !== -1,
    branch: text => !this.orgBranchInfo ? false : this.orgBranchInfo.getName().toLowerCase().indexOf(text) !== -1,
    status: text => !this.getOrgUserStatusLookup() ? false : this.getOrgUserStatusLookup()?.getName().toLowerCase().indexOf(text) !== -1,
    statusModifiedDate: 'statusDateModifiedString'
  };

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationUserService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  create(): Observable<OrgUser> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<OrgUser> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<OrgUser> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getOrgUserStatusLookup(): Lookup | null {
    // @ts-ignore
    return this.lookupService.getByLookupKeyAndCategory(this.status, LookupCategories.ORG_USER_STATUS);
  }

  showAuditLogs(_$event: MouseEvent): Observable<DialogRef> {
    return this.service.openAuditLogsById(this.id);
  }

  isExternal(): boolean {
    return true;
  }

  isInternal(): boolean {
    return false;
  }
}
