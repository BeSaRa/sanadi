import {BaseModel} from './base-model';
import {Observable} from 'rxjs';

export class OrgUnit extends BaseModel<OrgUnit> {
  phoneNumber1: string | undefined;
  phoneNumber2: string | undefined;
  email: string | undefined;
  zone: string | undefined;
  street: string | undefined;
  buildingName: string | undefined;
  unitName: string | undefined;
  address: string | undefined;
  statusDateModified: number | undefined;
  orgCode: string | undefined;
  orgUnitType: number | undefined;
  registryCreator: number | undefined;
  registryDate: number | undefined;
  orgNationality: number | undefined;
  poBoxNum: number | undefined;

  create(): Observable<OrgUnit> {
    throw new Error("No Impl");
  }

  delete(): Observable<boolean> {
    throw new Error("No Impl");
  }

  save(): Observable<OrgUnit> {
    throw new Error("No Impl");
  }

  update(): Observable<OrgUnit> {
    throw new Error("No Impl");
  }

}
