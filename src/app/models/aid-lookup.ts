import {BaseModel} from './base-model';
import {Observable} from 'rxjs';

export class AidLookup extends BaseModel<AidLookup> {
  category: number | undefined;
  status: boolean | undefined;
  statusDateModified: number | undefined;
  aidType: number | undefined;
  parent: number | undefined;

  create(): Observable<AidLookup> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<AidLookup> {
    throw new Error('No Impl');
  }

  update(): Observable<AidLookup> {
    throw new Error('No Impl');
  }
}
