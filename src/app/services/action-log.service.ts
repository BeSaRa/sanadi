import { AssignedTask } from '@models/assigned-task';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DialogService } from './dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BackendServiceModelInterface } from '@contracts/backend-service-model-interface';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { ActionRegistry } from '@models/action-registry';
import { ActionRegistryInterceptor } from '@model-interceptors/action-registry-interceptor';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlobModel } from '@models/blob-model';
import { IDefaultResponse } from '@contracts/idefault-response';
import { CastResponse } from "@decorators/cast-response";

export class ActionLogService implements Pick<BackendServiceModelInterface<ActionRegistry>, '_getModel' | '_getInterceptor'> {
  interceptor: ActionRegistryInterceptor = new ActionRegistryInterceptor();
  constructor(private service: {
    http: HttpClient,
    _getURLSegment(): string,
    dialog: DialogService,
    domSanitizer: DomSanitizer
  }) {
  }

  _getInterceptor(): Partial<IModelInterceptor<ActionRegistry>> {
    return this.interceptor;
  }

  _getModel(): any {
    return ActionRegistry;
  }


  @CastResponse(() => ActionRegistry)
  private _load(caseId: string): Observable<ActionRegistry[]> {
    return this.service.http.get<ActionRegistry[]>(this.service._getURLSegment() + '/' + caseId + '/actions');
  }

  load(caseId: string): Observable<ActionRegistry[]> {
    return this._load(caseId);
  }

  exportActions(caseId: string): Observable<BlobModel> {
    return this.service.http
      .get(this.service._getURLSegment() + '/' + caseId + '/actions/export', {
        observe: 'body',
        responseType: 'blob'
      }).pipe(map(blob => new BlobModel(blob, this.service.domSanitizer)));
  }

  loadCaseLocation(caseId: string): Observable<AssignedTask[]> {
    return this.service.http
      .get<IDefaultResponse<AssignedTask[]>>(this.service._getURLSegment() + '/' + caseId + '/assigned-to')
      .pipe(map((response) => response.rs.map(item => AssignedTask.createInstance(item))));
  }


  terminateTask(taskId: string): Observable<boolean> {
    return this.service.http.post<IDefaultResponse<boolean>>(this.service._getURLSegment() + '/task/terminate', {}, {
      params: new HttpParams().set('tkiid', taskId)
    }).pipe(map(response => response.rs))
  }
}
