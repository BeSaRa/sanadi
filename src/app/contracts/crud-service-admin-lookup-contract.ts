import {Observable} from 'rxjs';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {PaginationContract} from '@contracts/pagination-contract';
import {Pagination} from '@app/models/pagination';

export interface CrudServiceAdminLookupContract<T> {
  load(typeId: AdminLookupTypeEnum): Observable<T[]>;

  create(model: T, typeId: AdminLookupTypeEnum): Observable<T>;

  update(model: T, typeId: AdminLookupTypeEnum): Observable<T>;

  delete(modelId: number, typeId: AdminLookupTypeEnum): Observable<boolean>;

  getById(modelId: number, typeId: AdminLookupTypeEnum): Observable<T>;

  paginate(options: PaginationContract, typeId: AdminLookupTypeEnum): Observable<Pagination<T[]>>

  paginateComposite(options: PaginationContract, typeId: AdminLookupTypeEnum): Observable<Pagination<T[]>>
}
