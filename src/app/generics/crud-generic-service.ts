import { HttpClient } from "@angular/common/http";
import { iif, Observable, of, Subject } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";
import { IKeyValue } from "@contracts/i-key-value";
import { isValidValue } from "@helpers/utils";
import { CrudServiceInterface } from "@contracts/crud-service-interface";
import { CastResponse } from "@decorators/cast-response";
import { GetModelContract } from "@contracts/get-model-contract";
import { PaginationContract } from "@contracts/pagination-contract";
import { Pagination } from "@app/models/pagination";

export abstract class CrudGenericService<T> implements CrudServiceInterface<T>, GetModelContract<T> {
  abstract _getModel(): new () => T

  abstract list: T[];
  abstract http: HttpClient;
  _loadDone$: Subject<T[]> = new Subject<T[]>();
  // 15 min in milliseconds
  protected _timeRange: number = 15 * 60 * 1000;
  protected _lastLoadTime!: number;
  protected _emptyPaginationListResponse = {
    rs: [],
    count: 0,
    sc: 200
  } as Pagination<T[]>;

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _load(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL());
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadComposite(_options?: any): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL() + '/composite');
  }

  @HasInterception
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _update(@InterceptParam() model: T): Observable<T> {
    return this.http.put<T>(this._getServiceURL() + '/full', model);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  @HasInterception
  _updateBulk(@InterceptParam() models: T[]): Observable<T[]> {
    return this.http.put<T[]>(this._getServiceURL() + '/bulk', models)
  }

  updateBulk(models: T[]): Observable<T[]> {
    return this._updateBulk(models)
  }

  load(prepare?: boolean): Observable<T[]> {
    return this._load()
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  loadComposite(options?: any): Observable<T[]> {
    return this._loadComposite(options).pipe(
      tap(result => this.list = result),
      tap(result => this._loadDone$.next(result))
    );
  }

  loadByTime(prepare?: boolean): Observable<T[]> {
    const reload$ = this.load(prepare).pipe(tap(_ => this._lastLoadTime = Date.now()));
    return of(this.list)
      .pipe(switchMap(list => {
        return iif(() => {
          return !!list.length && (Date.now() - this._lastLoadTime < this._timeRange)
        }, of(list), reload$)
      }));
  }

  loadIfNotExists(prepare?: boolean): Observable<T[]> {
    return of(this.list)
      .pipe(switchMap(list => iif(() => !!list.length, of(list), this.load(prepare))))
  }

  @HasInterception
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadActive(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL() + '/active/lookup')
  }

  loadActive(): Observable<T[]> {
    return this._loadActive();
  }

  @HasInterception
  @CastResponse(undefined)
  create(@InterceptParam() model: T): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/full', model);
  }

  @CastResponse(undefined, {
    fallback: '',
    unwrap: 'rs'
  })
  delete(modelId: number): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + modelId);
  }

  @CastResponse(undefined, {
    fallback: '',
    unwrap: 'rs'
  })
  deleteBulk(modelIds: any[]): Observable<Record<number, boolean>> {
    return this.http.request<Record<number, boolean>>('delete', this._getServiceURL() + '/bulk', { body: modelIds })
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _getById(modelId: number): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + modelId);
  }

  getById(modelId: number): Observable<T> {
    return this._getById(modelId)
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  @HasInterception
  _createBulk(@InterceptParam() models: T[]): Observable<T[]> {
    return this.http.post<T[]>(this._getServiceURL() + '/bulk/full', models)
  }

  createBulk(models: T[]): Observable<T[]> {
    return this._createBulk(models)
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _getByIdComposite(modelId: number): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + modelId + '/composite');
  }

  getByIdComposite(modelId: number): Observable<T> {
    return this._getByIdComposite(modelId)
  }

  update(model: T): Observable<T> {
    return this._update(model);
  }

  abstract _getServiceURL(): string;

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginate(options: Partial<PaginationContract>): Observable<Pagination<T[]>> {
    return this.http.get<Pagination<T[]>>(this._getServiceURL() + '/pg', {
      params: { ...options }
    })
  }

  paginate(options: Partial<PaginationContract>): Observable<Pagination<T[]>> {
    return this._paginate(options).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginateComposite(options: Partial<PaginationContract>): Observable<Pagination<T[]>> {
    return this.http.get<Pagination<T[]>>(this._getServiceURL() + '/composite/pg', {
      params: { ...options }
    })
  }
  paginateComposite(options: Partial<PaginationContract>): Observable<Pagination<T[]>> {
    return this._paginateComposite(options).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _paginatefilter(options: Partial<PaginationContract>, paginatefilter: Partial<T>): Observable<Pagination<T[]>> {
    return this.http.post<Pagination<T[]>>(this._getServiceURL() + '/filter/pg', { ...paginatefilter }, {
      params: { ...options }
    })
  }
  paginatefilter(options: Partial<PaginationContract>, paginatefilter: Partial<T>): Observable<Pagination<T[]>> {
    return this._paginatefilter(options, paginatefilter).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadFilter(_options: Partial<PaginationContract>, filter: Partial<T>): Observable<T[]> {
    return this.http.post<T[]>(this._getServiceURL() + '/filter', { ...filter }, {
      params: { ..._options }
    });
  }

  loadFilter(filter: Partial<T>, options?: any): Observable<T[]> {
    return this._loadFilter(options, filter).pipe(
      tap(result => this.list = result),
      tap(result => this._loadDone$.next(result))
    );
  }

  _generateQueryString(queryStringOptions: IKeyValue): string {
    let queryString = '?';
    for (const key of Object.keys(queryStringOptions)) {
      if (isValidValue(queryStringOptions[key])) {
        if (typeof queryStringOptions[key] === 'string') {
          queryString += key + '=' + queryStringOptions[key].trim() + '&';
        } else {
          queryString += key + '=' + queryStringOptions[key] + '&';
        }
      }
    }
    return queryString.substring(0, queryString.length - 1);
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadAsLookups(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL() + '/lookup');
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadFilterByMainTeamAsLookups(teamsList: number[]): Observable<T[]> {
    return this.http.post<T[]>(this._getServiceURL() + '/parent', teamsList);
  }
  _parseObjectToQueryString(data: IKeyValue, myKey?: string): string {
    let queryString = [];
    for (const key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }
      if (typeof data[key] === 'object') {
        queryString.push(this._parseObjectToQueryString(data[key], myKey ? (myKey + '.' + key) : key));
      } else {
        if (data[key] !== undefined && data[key] !== null && (data[key] + '').trim().length) {
          let value = data[key];
          if (typeof data[key] === 'string') {
            value = data[key].trim();
          }
          queryString.push(myKey ? (myKey + `.${key}=${value}`) : key + '=' + data[key]);
        }
      }
    }
    return queryString.filter((item) => {
      return item;
    }).join('&');
  }
}
