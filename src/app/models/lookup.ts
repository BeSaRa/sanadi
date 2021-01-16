import {BaseModel} from './base-model';
import {LookupCategories} from '../enums/lookup-categories';
import {Observable} from 'rxjs';

export class Lookup extends BaseModel<Lookup> {
  category!: LookupCategories;
  lookupKey: number | undefined;
  lookupStrKey: string | undefined;
  status: number | undefined;
  itemOrder: number | undefined;
  parent: number | undefined;

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
