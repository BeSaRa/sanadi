import {BackendServiceInterface} from '../interfaces/backend-service-interface';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, mapTo, tap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {IKeyValue} from '../interfaces/i-key-value';
import {isValidValue} from '../helpers/utils';

export abstract class BackendGenericService<T extends { id?: number }> implements BackendServiceInterface<T> {
  abstract list: T[];
  abstract http: HttpClient;
  _loadDone$: Subject<T[]> = new Subject<T[]>();

  @Generator(undefined, true, {property: 'rs'})
  private _load(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL());
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _update(@InterceptParam() model: T): Observable<T> {
    return this.http.put<T>(this._getServiceURL() + '/full', model);
  }


  load(prepare?: boolean): Observable<T[]> {
    return this._load()
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  create(@InterceptParam() model: T): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/full', model);
  }

  delete(modelId: number): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + modelId);
  }

  @Generator()
  getById(modelId: number): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + modelId);
  }

  @SendInterceptor()
  update(@InterceptParam() model: T): Observable<T> {
    return this._update(model);
  }

  abstract _getModel(): any;

  abstract _getSendInterceptor(): any;

  abstract _getServiceURL(): string;

  abstract _getReceiveInterceptor(): any

  _generateQueryString(queryStringOptions: IKeyValue): string {
    let queryString = '?';
    for (const key of Object.keys(queryStringOptions)) {
      if (isValidValue(queryStringOptions[key])) {
        queryString += key + '=' + queryStringOptions[key] + '&';
      }
    }
    return queryString.substring(0, queryString.length - 1);
  }
}

