import { Observable } from 'rxjs';
import { Pagination } from "@app/models/pagination";
import { PaginationContract } from "@contracts/pagination-contract";

export interface CrudServiceInterface<T> {

  load(prepare: boolean): Observable<T[]>;

  create(model: T): Observable<T>;

  update(model: T): Observable<T>;

  delete(modelId: number): Observable<boolean>;

  getById(modelId: number): Observable<T>;

  loadComposite(): Observable<T[]>

  paginate(options: PaginationContract): Observable<Pagination<T[]>>

  paginateComposite(options: PaginationContract): Observable<Pagination<T[]>>

  loadFilter(filterModel: Partial<T>, options: PaginationContract): Observable<T[]>

  paginatefilter(options: PaginationContract, filterModel: Partial<T>): Observable<Pagination<T[]>>

}
