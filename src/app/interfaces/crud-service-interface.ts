import { Observable } from 'rxjs';

export interface CrudServiceInterface<T> {

  load(prepare: boolean): Observable<T[]>;

  create(model: T): Observable<T>;

  update(model: T): Observable<T>;

  delete(modelId: number): Observable<boolean>;

  getById(modelId: number): Observable<T>;

}
