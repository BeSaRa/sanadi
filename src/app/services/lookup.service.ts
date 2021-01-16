import {Injectable} from '@angular/core';
import {Lookup} from '../models/lookup';
import {DialogRef} from '../shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {LookupCategories} from '../enums/lookup-categories';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor() {
  }

  create(model: Lookup): Observable<Lookup> {
    throw Error('there is no implementation');
  }

  delete(modelId: number): Observable<boolean> {
    throw Error('there is no implementation');
  }

  getById(modelId: number): Observable<Lookup> {
    throw Error('there is no implementation');
  }

  load(prepare: boolean): Observable<Lookup[]> {
    throw Error('there is no implementation');
  }

  openCreateDialog(lookupCategory: LookupCategories): DialogRef {
    throw Error('there is no implementation');
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    throw Error('there is no implementation');
  }

  update(model: Lookup): Observable<Lookup> {
    throw Error('there is no implementation');
  }
}
