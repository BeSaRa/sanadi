import {HttpClient} from '@angular/common/http';
import {DialogService} from './dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {ActionRegistry} from '../models/action-registry';
import {ActionRegistryInterceptor} from '../model-interceptors/action-registry-interceptor';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import {map} from 'rxjs/operators';
import {BlobModel} from '../models/blob-model';

export class ActionLogService<T extends {
  http: HttpClient,
  _getServiceURL(): string,
  dialog: DialogService,
  domSanitizer: DomSanitizer
}> implements Pick<BackendServiceModelInterface<ActionRegistry>, '_getModel' | '_getInterceptor'> {
  interceptor: ActionRegistryInterceptor = new ActionRegistryInterceptor();

  constructor(private service: T) {
  }

  _getInterceptor(): Partial<IModelInterceptor<ActionRegistry>> {
    return this.interceptor;
  }

  _getModel(): any {
    return ActionRegistry;
  }


  @Generator(undefined, true, {property: 'rs'})
  private _load(caseId: string): Observable<ActionRegistry[]> {
    return this.service.http.get<ActionRegistry[]>(this.service._getServiceURL() + '/' + caseId + '/actions');
  }

  load(caseId: string): Observable<ActionRegistry[]> {
    return this._load(caseId);
  }

  exportActions(caseId: string): Observable<BlobModel> {
    return this.service.http.get(this.service._getServiceURL() + '/' + caseId + '/actions/export', {
      observe: 'body',
      responseType: 'blob'
    }).pipe(map(blob => new BlobModel(blob, this.service.domSanitizer)));
  }
}
