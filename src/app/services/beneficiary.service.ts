import {Injectable} from '@angular/core';
import {Beneficiary} from '../models/beneficiary';
import {FactoryService} from './factory.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {BeneficiaryInterceptor} from '../model-interceptors/beneficiary-interceptor';
import {IBeneficiaryCriteria} from '@contracts/i-beneficiary-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {
  SelectBeneficiaryPopupComponent
} from '../sanady/popups/select-beneficiary-popup/select-beneficiary-popup.component';
import {Pair} from '@contracts/pair';
import {BeneficiarySaveStatus} from '../enums/beneficiary-save-status.enum';
import {map} from 'rxjs/operators';
import {GeneralInterceptor} from '@app/model-interceptors/general-interceptor';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {SanadiAuditResultInterceptor} from '@app/model-interceptors/sanadi-audit-result-interceptor';
import {BeneficiaryIncomeInterceptor} from '@app/model-interceptors/beneficiary-income-interceptor';
import {BeneficiaryObligationInterceptor} from '@app/model-interceptors/beneficiary-obligation-interceptor';
import {IBeneficiarySearchLogCriteria} from '@contracts/i-beneficiary-search-log-criteria';
import {ConfigurationService} from '@services/configuration.service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {BeneficiarySearchLog} from '@app/models/beneficiary-search-log';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {
  BeneficiarySearchLogCriteriaInterceptor
} from '@app/model-interceptors/beneficiary-search-log-criteria-interceptor';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {IGdxCriteria} from '@contracts/i-gdx-criteria';
import {GdxMophResponse} from '@app/models/gdx-moph-response';
import {GdxMojResponse} from '@app/models/gdx-moj-response';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {Pagination} from '@app/models/pagination';
import {GdxMawaredResponse} from '@app/models/gdx-mawared-response';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';

const beneficiarySearchLogCriteriaInterceptor = new BeneficiarySearchLogCriteriaInterceptor();

@CastResponseContainer({
  $default: {
    model: () => Beneficiary
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => Beneficiary}
  }
})
@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService extends CrudGenericService<Beneficiary> {
  list!: Beneficiary[];
  beneficiaryIncomeInterceptor = new BeneficiaryIncomeInterceptor();
  beneficiaryObligationInterceptor = new BeneficiaryObligationInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private configurationService: ConfigurationService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('BeneficiaryService', this);
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this.http.post<Beneficiary[]>(this.urlService.URLS.BENEFICIARY + '/criteria', criteria);
  }

  loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this._loadByCriteria(criteria);
  }

  @HasInterception
  createWithValidate(@InterceptParam() beneficiary: Partial<Beneficiary>, validate: boolean = true, validateMoph: boolean = true): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    delete beneficiary.id;
    let params = new HttpParams({
      fromObject: {'with-check': validate + '', 'with-moph-check': validateMoph},
    });
    return this.http.post<Pair<BeneficiarySaveStatus, Beneficiary>>(this._getServiceURL() + '/validate-save', beneficiary, {
      params: params
    }).pipe(map((response: any) => {
      response.rs.second = response.rs.second ? this._getReceiveInterceptor()(new Beneficiary().clone(response.rs.second)) : response.rs.second;
      return response.rs;
    }));
  }

  _getModel() {
    return Beneficiary;
  }

  _getSendInterceptor() {
    return (new BeneficiaryInterceptor).send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.BENEFICIARY;
  }


  _getReceiveInterceptor() {
    return (new BeneficiaryInterceptor).receive;
  }

  openSelectBeneficiaryDialog(list: Beneficiary[]): DialogRef {
    return this.dialogService.show<Beneficiary[]>(SelectBeneficiaryPopupComponent, list);
  }

  /**
   * @description Loads the beneficiary audit data by request id
   * @param requestId
   */
  loadBeneficiaryAuditData(requestId: number): Observable<SanadiAuditResult[]> {
    return this.http.get<IDefaultResponse<SanadiAuditResult[]>>(this._getServiceURL() + '/audit/' + requestId)
      .pipe(
        map((result) => {
          return result.rs.map(data => {
            let item = Object.assign(new SanadiAuditResult, data),
              interceptor = new SanadiAuditResultInterceptor();

            item = GeneralInterceptor.receive(item);
            item.auditEntity = 'BENEFICIARY';
            return interceptor.receive(item);
          });
        })
      );
  }

  @CastResponse(undefined)
  private _loadBeneficiaryAuditDetails(auditId: number): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(this._getServiceURL() + '/audit/updates/' + auditId);
  }

  loadBeneficiaryAuditDetails(auditId: number): Observable<Beneficiary> {
    return this._loadBeneficiaryAuditDetails(auditId);
  }

  @HasInterception
  @CastResponse(() => BeneficiarySearchLog, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _loadBeneficiaryLogByCriteria(@InterceptParam(beneficiarySearchLogCriteriaInterceptor.send) criteria: Partial<IBeneficiarySearchLogCriteria>): Observable<BeneficiarySearchLog[]> {
    criteria.limit = this.configurationService.CONFIG.BENEFICIARY_AUDIT_LIMIT;
    return this.http.post<BeneficiarySearchLog[]>(this._getServiceURL() + '/search/audit/criteria', criteria);
  }

  loadBeneficiaryLogByCriteria(criteria: Partial<IBeneficiarySearchLogCriteria>): Observable<BeneficiarySearchLog[]> {
    return this._loadBeneficiaryLogByCriteria(criteria);
  }

  @CastResponse(() => GdxMophResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadGDXMOPHMortality(criteria: IGdxCriteria) {
    return this.http.post<GdxMophResponse[]>(this._getServiceURL() + '/gdx/moph/mortality', criteria);
  }

  @CastResponse(() => GdxServiceLog, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadGDXIntegrationData(criteria: IGdxCriteria) {
    return this.http.post<GdxServiceLog[]>(this._getServiceURL() + '/gdx/audit', criteria);
  }

  @CastResponse(() => GdxMojResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOJInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMojResponse[]>(this._getServiceURL() + '/gdx/moj/real-estate', criteria);
  }

  @CastResponse(() => GdxMociResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOCIInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMociResponse[]>(this._getServiceURL() + '/gdx/moci/commercial-record', criteria);
  }

  @CastResponse(() => GdxMawaredResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMAWAREDInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMawaredResponse[]>(this._getServiceURL() + '/gdx/mawared/last-salary', criteria);
  }

  @CastResponse(() => GdxGarsiaPensionResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addGarsiaInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxGarsiaPensionResponse[]>(this._getServiceURL() + '/gdx/garsia/pension', criteria);
  }

  loadIzzabStatus(criteria: IGdxCriteria): Observable<any> {
    return this.http.post<any>(this._getServiceURL() + '/gdx/izzab-status', criteria)
      .pipe(map(response => response.rs));
  }

  @CastResponse(() => GdxKahramaaResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addKahramaaInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxKahramaaResponse[]>(this._getServiceURL() + '/gdx/kaharmaa-outstanding', criteria);
  }
}
