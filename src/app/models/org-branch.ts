import {BaseModel} from './base-model';

export class OrgBranch extends BaseModel {
  orgId: number | undefined;
  phoneNumber1: string | undefined;
  phoneNumber2: string | undefined;
  email: string | undefined;
  zone: string | undefined;
  street: string | undefined;
  buildingName: string | undefined;
  unitName: string | undefined;
  address: string | undefined;
  statusDateModified: number | undefined;
}
