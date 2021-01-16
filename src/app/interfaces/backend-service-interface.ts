import {Observable} from 'rxjs';

export interface BackendServiceInterface<T, D> {
  list: T[];

  load(prepare: boolean): Observable<T[]>

  create(model: T): Observable<T>

  update(model: T): Observable<T>

  delete(modelId: number): Observable<boolean>

  getById(modelId: number): Observable<T>

  openUpdateDialog(modelId: number): Observable<D>

  openCreateDialog(): D
}
