import {Observable} from 'rxjs';

export interface ModelCrudInterface<D> {
  save(): Observable<D>

  update(): Observable<D>

  create(): Observable<D>

  delete(): Observable<boolean>
}
