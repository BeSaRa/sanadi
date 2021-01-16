import {BaseModel} from './base-model';
import {Lookup} from './lookup';
import {Observable} from 'rxjs';

export class OrgBranch extends BaseModel<Lookup> {
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

  create(): Observable<Lookup> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<Lookup> {
    throw new Error('No Impl');
  }

  update(): Observable<Lookup> {
    throw new Error('No Impl');
  }
}
