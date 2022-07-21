import {Observable} from 'rxjs';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';

export interface BaseModelAdminLookupContract<D> {
  save(typeId: AdminLookupTypeEnum): Observable<D>;

  update(typeId: AdminLookupTypeEnum): Observable<D>;

  create(typeId: AdminLookupTypeEnum): Observable<D>;

  delete(typeId: AdminLookupTypeEnum): Observable<boolean>;
}
