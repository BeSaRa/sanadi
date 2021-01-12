import {BaseModel} from './base-model';

export class OrgUser extends BaseModel {
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

  create(): void {
  }

  delete(): void {
  }

  save(): void {
  }

  update(): void {
  }
}
