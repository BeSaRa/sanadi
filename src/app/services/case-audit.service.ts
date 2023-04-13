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
import {CustomsExemptionRemittance} from '@models/customs-exemption-remittance';
import {CustomsExemptionRemittanceInterceptor} from '@model-interceptors/customs-exemption-remittance-interceptor';
import {
  AuditCustomsExemptionComponent
} from '@modules/services/customs-exemption-remittance/audit/audit-customs-exemption/audit-customs-exemption.component';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { AuditOrganizationsEntitiesSupportComponent } from '@app/modules/services/organization-entities-support/audit/audit-organizations-entities-support/audit-organizations-entities-support.component';
import { OrganizationsEntitiesSupportInterceptor } from '@app/model-interceptors/organizations-entities-support-interceptor';

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
  caseModels: { [key in CaseTypes]?: any } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: CustomsExemptionRemittance,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: OrganizationsEntitiesSupport,
  };
  caseInterceptors: { [key in CaseTypes]?: any } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: CustomsExemptionRemittanceInterceptor,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: OrganizationsEntitiesSupportInterceptor,
  };
  auditCaseComponents: { [key in CaseTypes]?: ComponentType<any> } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: AuditCustomsExemptionComponent,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: AuditOrganizationsEntitiesSupportComponent,
  };

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
