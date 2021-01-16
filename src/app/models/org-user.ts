import {BaseModel} from './base-model';
import {Observable} from 'rxjs';

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

  create(): Observable<OrgUser> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<OrgUser> {
    throw new Error('No Impl');
  }

  update(): Observable<OrgUser> {
    throw new Error('No Impl');
  }
}
