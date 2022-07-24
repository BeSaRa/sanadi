import {Observable} from 'rxjs';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';

export interface CrudServiceAdminLookupContract<T> {
  load(typeID: AdminLookupTypeEnum): Observable<T[]>;

  create(model: T, typeID: AdminLookupTypeEnum): Observable<T>;

  update(model: T, typeID: AdminLookupTypeEnum): Observable<T>;

  delete(modelId: number, typeID: AdminLookupTypeEnum): Observable<boolean>;

  getById(modelId: number, typeID: AdminLookupTypeEnum): Observable<T>;
}
