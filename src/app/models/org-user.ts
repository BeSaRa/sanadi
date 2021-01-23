import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {OrgUnit} from './org-unit';
import {OrgBranch} from './org-branch';
import {CustomRole} from './custom-role';
import {FactoryService} from '../services/factory.service';
import {OrganizationUserService} from '../services/organization-user.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';

export class OrgUser extends BaseModel<OrgUser> {
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
  status: boolean | undefined;
  orgUnitInfo: OrgUnit | undefined;
  orgBranchInfo: OrgBranch | undefined;
  statusInfo: any | undefined; // need to bind to model
  userTypeInfo: any | undefined; // need to bind to model
  jobTitleInfo: any | undefined; // need to bind to model
  customRoleInfo: CustomRole | undefined;

  private service: OrganizationUserService;
  private langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationUserService');
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<OrgUser> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
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
}
