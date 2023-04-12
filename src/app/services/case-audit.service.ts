import {Injectable} from '@angular/core';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Pagination} from '@models/pagination';
import {CaseAudit} from '@models/case-audit';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CaseModel} from '@models/case-model';
import {CaseTypes} from '@enums/case-types.enum';
import {ComponentType} from '@angular/cdk/overlay';
import {CaseAuditPopupComponent} from '@modules/e-services-main/popups/case-audit-popup/case-audit-popup.component';

@CastResponseContainer({
  $default: {
    model: () => CaseAudit
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => CaseAudit}
  }
})
@Injectable({
  providedIn: 'root'
})
export class CaseAuditService extends CrudGenericService<CaseAudit> {
  list: CaseAudit[] = [];
  caseModels: { [key in CaseTypes]?: any } = {};
  caseInterceptors: { [key in CaseTypes]?: any } = {};
  auditCaseComponents: { [key in CaseTypes]?: ComponentType<any> } = {};

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('CaseAuditService', this);
  }

  _getModel(): { new(): CaseAudit } {
    return CaseAudit;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CASE_AUDIT;
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: Partial<{ caseId: string, version: number }>) {
    return this.http.get<CaseAudit[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    }).pipe(catchError(() => of([] as CaseAudit[])));
  }

  loadAuditsByCaseId(caseId: string): Observable<CaseAudit[]> {
    if (!caseId) {
      return of([]);
    }
    return this._loadByCriteria({caseId: caseId})
      .pipe(catchError(() => of([])));
  }

  showDifference(newVersion: CaseModel<any, any>, caseAudit: CaseAudit) {
    this.dialog.show(CaseAuditPopupComponent, {
      newVersion: newVersion,
      caseAudit: caseAudit
    }, {fullscreen: true})
  }
}
