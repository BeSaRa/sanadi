import {BackendServiceInterface} from '../interfaces/backend-service-interface';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';

export abstract class BackendGenericService<T, D> implements BackendServiceInterface<T, D> {
  abstract list: T[];
  abstract http: HttpClient;
  _loadDone$: Subject<T[]> = new Subject<T[]>();

  @Generator(undefined, true)
  private _load(): Observable<T[]> {
    return this.http.get<T[]>(this._getServiceURL());
  }


  load(prepare?: boolean): Observable<T[]> {
    return this._load()
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  @SendInterceptor()
  create(@InterceptParam() model: T): Observable<T> {
    return this.http.post<T>(this._getServiceURL(), model);
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
    // @ts-ignore
    return this.http.put<T>(this._getServiceURL() + '/' + model.id, model);
  }


  abstract openCreateDialog(): D

  abstract openUpdateDialog(modelId: number): Observable<D>

  abstract _getModel(): any;

  abstract _getSendInterceptor(): any;

  abstract _getServiceURL(): string;
}

