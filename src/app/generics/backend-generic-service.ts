import {BackendServiceInterface} from '../interfaces/backend-service-interface';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {IKeyValue} from '../interfaces/i-key-value';
import {isValidValue} from '../helpers/utils';

export abstract class BackendGenericService<T> implements BackendServiceInterface<T> {
  abstract list: T[];
  abstract http: HttpClient;
  _loadDone$: Subject<T[]> = new Subject<T[]>();

  @Generator(undefined, true, {property: 'rs'})
  private _load(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL());
  }

  // noinspection JSUnusedLocalSymbols
  @Generator(undefined, true, {property: 'rs'})
  private _loadComposite(options?: any): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL() + '/composite');
  }

  @Generator(undefined, false, {property: 'rs'})
  private _update(model: T): Observable<T> {
    return this.http.put<T>(this._getServiceURL() + '/full', model);
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

  @Generator(undefined, true, {property: 'rs'})
  private _loadActive(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL() + '/active/lookup')
  }

  loadActive(): Observable<T[]> {
    return this._loadActive();
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  create(@InterceptParam() model: T): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/full', model);
  }

  delete(modelId: number): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + modelId);
  }

  deleteBulk(modelIds: any[]): Observable<any> {
    return this.http.request('delete', this._getServiceURL() + '/bulk', {body: modelIds})
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  @Generator()
  getById(modelId: number): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + modelId);
  }

  @Generator()
  getByIdComposite(modelId: number): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + modelId + '/composite');
  }

  @SendInterceptor()
  update(@InterceptParam() model: T): Observable<T> {
    return this._update(model);
  }

  abstract _getModel(): any;

  abstract _getSendInterceptor(): any;

  abstract _getServiceURL(): string;

  abstract _getReceiveInterceptor(): any;

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

