import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {GdxMsdfSecurityResponse} from '@app/models/gdx-msdf-security';
import {GdxMsdfHousingResponse} from '@app/models/gdx-msdf-housing';
import {GdxEidCharitableFoundationResponse} from './../models/gdx-eid-charitable-foundation-response';
import {GdxQatarRedCrescentResponse} from './../models/gdx-qatar-red-crescent-response';
import {Injectable} from '@angular/core';
import {Beneficiary} from '../models/beneficiary';
import {FactoryService} from './factory.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable, forkJoin, of} from 'rxjs';
import {BeneficiaryInterceptor} from '../model-interceptors/beneficiary-interceptor';
import {IBeneficiaryCriteria} from '@contracts/i-beneficiary-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {
  SelectBeneficiaryPopupComponent
} from '../sanady/popups/select-beneficiary-popup/select-beneficiary-popup.component';
import {Pair} from '@contracts/pair';
import {BeneficiarySaveStatus} from '../enums/beneficiary-save-status.enum';
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
import {GdxMolPayrollResponse} from '@app/models/gdx-mol-payroll-response';
import {GdxSjcMaritalStatusResponse} from '@models/gdx-sjc-marital-status-response';
import {GdxMoeResponse} from '@app/models/gdx-moe-pending-installments';
import {GdxMmeResponse} from '@app/models/gdx-mme-leased-contract';
import {GdxQatarCharityResponse} from '@app/models/gdx-qatar-charity-response';
import {GdxQCBResponse} from '@app/models/gdx-qcb-response';
import {DomSanitizer} from '@angular/platform-browser';
import {FileExtensionsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {SharedService} from '@services/shared.service';
import {GdxMoiAddress} from '@app/models/gdx-moi-address';
import {GdxMoiPersonal} from '@app/models/gdx-moi-personal';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {LookupService} from './lookup.service';
import {BeneficiaryFamilyMemberInterceptor} from '@model-interceptors/beneficiary-family-member-interceptor';
import {ReportAuditCriteria} from '@models/report-audit-criteria';
import {ReportAuditResult} from '@models/report-audit-result';
import {ReportAuditInterceptor} from '@model-interceptors/report-audit-interceptor';
import {GdxQcbIbanResponse} from '@models/gdx-qcb-iban-response';
import {QcbFilesPopupComponent} from '@app/sanady/popups/qcb-files-popup/qcb-files-popup.component';
import {SubventionRequestAid} from '@models/subvention-request-aid';

const beneficiarySearchLogCriteriaInterceptor = new BeneficiarySearchLogCriteriaInterceptor();
const reportAuditCriteriaInterceptor = new ReportAuditInterceptor();

@CastResponseContainer({
  $default: {
    model: () => Beneficiary
  },
  $reportAuditPagination: {
    model: () => Pagination,
    shape: {'rs.*': () => ReportAuditResult}
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
  beneficiaryFamilyMemberInterceptor = new BeneficiaryFamilyMemberInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              private configurationService: ConfigurationService,
              private sharedService: SharedService,
              private dialogService: DialogService,
              private lookupService: LookupService) {
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

  _getGDXServiceURL(): string {
    return this.urlService.URLS.BENEFICIARY + '/gdx';
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
    return this.http.post<GdxMophResponse[]>(this._getGDXServiceURL() + '/moph/mortality', criteria);
  }

  @HasInterception
  @CastResponse(() => GdxMophResponse, {
    fallback: '$pagination'
  })
  beneficiaryStatus(@InterceptParam() beneficiary: Partial<Beneficiary>): Observable<Pagination<SubventionRequestAid[]>> {
    return this.http.post<Pagination<SubventionRequestAid[]>>(this._getServiceURL() + '/beneficiary-status', beneficiary);
  }


  @CastResponse(() => GdxServiceLog, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadGDXIntegrationData(criteria: IGdxCriteria) {
    return this.http.post<GdxServiceLog[]>(this._getGDXServiceURL() + '/audit', criteria);
  }

  @CastResponse(() => GdxMojResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOJInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMojResponse[]>(this._getGDXServiceURL() + '/moj/real-estate', criteria);
  }

  @CastResponse(() => GdxMociResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOCIInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMociResponse[]>(this._getGDXServiceURL() + '/moci/commercial-record', criteria);
  }

  @CastResponse(() => GdxMawaredResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMAWAREDInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMawaredResponse[]>(this._getGDXServiceURL() + '/mawared/last-salary', criteria);
  }

  @CastResponse(() => GdxGarsiaPensionResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addGarsiaInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxGarsiaPensionResponse[]>(this._getGDXServiceURL() + '/garsia/pension', criteria);
  }

  addIzzabInquiry(criteria: IGdxCriteria): Observable<any> {
    return this.http.post<any>(this._getGDXServiceURL() + '/izzab-status', criteria)
      .pipe(map(response => response.rs));
  }

  @CastResponse(() => GdxKahramaaResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addKahramaaInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxKahramaaResponse[]>(this._getGDXServiceURL() + '/kaharmaa-outstanding', criteria);
  }

  @CastResponse(() => GdxMolPayrollResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOLInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMolPayrollResponse[]>(this._getGDXServiceURL() + '/mol-payroll', criteria);
  }

  @CastResponse(() => GdxSjcMaritalStatusResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addSJCInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxSjcMaritalStatusResponse[]>(this._getGDXServiceURL() + '/sjc/marital-status', criteria);
  }

  @CastResponse(() => GdxMoeResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMOEPendingInstallments(criteria: IGdxCriteria) {
    return this.http.post<GdxMoeResponse[]>(this._getGDXServiceURL() + '/moe-pending-installments', criteria);
  }

  @CastResponse(() => GdxMmeResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addMMELeasedContract(criteria: IGdxCriteria) {
    return this.http.post<GdxMmeResponse[]>(this._getGDXServiceURL() + '/mme-leased-contracts', criteria);
  }

  @CastResponse(() => GdxQatarCharityResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addQatarCharityInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxQatarCharityResponse[]>(this._getGDXServiceURL() + '/qc-historical-data', criteria);
  }

  @CastResponse(() => GdxEidCharitableFoundationResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addEidCharitableFoundationInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxEidCharitableFoundationResponse[]>(this._getGDXServiceURL() + '/eid-historical-data', criteria);
  }

  @CastResponse(() => GdxQatarRedCrescentResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addQatarRedCrescentInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxQatarRedCrescentResponse[]>(this._getGDXServiceURL() + '/qrcs-historical-data', criteria);
  }

  @CastResponse(() => GdxQcbIbanResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addQCBIbanInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxQcbIbanResponse[]>(this._getGDXServiceURL() + '/qcb/iban', criteria);
  }

  @CastResponse(() => GdxMsdfHousingResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addHousingBenStatusInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMsdfHousingResponse[]>(this._getGDXServiceURL() + '/msdf/housing-beneficiary-status', criteria);
  }

  @CastResponse(() => GdxMsdfSecurityResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addSecurityBenStatusInquiry(criteria: IGdxCriteria) {
    return this.http.post<GdxMsdfSecurityResponse[]>(this._getGDXServiceURL() + '/msdf/security-beneficiary-status', criteria);
  }

  @CastResponse(() => GdxQCBResponse, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private addQCBInquiry(criteria: IGdxCriteria, file: File, consentFile: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    file ? formData.append('consentFile', consentFile) : null;
    formData.append('entity', JSON.stringify({
      benId: criteria.benId,
      gdxServiceId: criteria.gdxServiceId,
      qId: criteria.qId
    }));
    return this.http.post<GdxQCBResponse[]>(this._getGDXServiceURL() + '/qcb/create-report', formData);
  }

  addQCBInquiryReport(criteria: IGdxCriteria): Observable<GdxQCBResponse[]> {
    return this.dialogService.show(QcbFilesPopupComponent, {
      title: 'file_uploader',
      extensions: [FileExtensionsEnum.PDF, FileExtensionsEnum.PNG, FileExtensionsEnum.JPG, FileExtensionsEnum.JPEG]
    }).onAfterClose$
      .pipe(
        filter(({file}) => !!file),
        switchMap(({file, consentFile}) => {
          return this.addQCBInquiry(criteria, file, consentFile);
        })
      );
  }

  @CastResponse(() => GdxMoiPersonal, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addPersonalInfoInquiry(qId: string, expiryDate: string) {
    let criteria: IGdxCriteria = {
      gdxServiceId: GdxServicesEnum.MOI_PERSONAL_INFO,
      qId,
      expiryDate
    };
    return this.http.post<GdxMoiPersonal>(this._getGDXServiceURL() + '/moi/person-info', criteria);
  }

  @CastResponse(() => GdxMoiAddress, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addAddressInfoInquiry(qId: string, expiryDate: string) {
    let criteria: IGdxCriteria = {
      gdxServiceId: GdxServicesEnum.MOI_ADDRESS_INFO,
      qId,
      expiryDate
    };
    return this.http.post<GdxMoiAddress>(this._getGDXServiceURL() + '/moi/address-info', criteria);
  }

  getBeneficiaryFromMoiData(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {

    const genders = this.lookupService.listByCategory.Gender;
    const {benPrimaryIdNumber, expiryDate} = criteria;
    const expiryDateString = DateUtils.changeDateFromDatepicker(expiryDate as unknown as IMyDateModel)?.toLocaleDateString('en-CA');
    return forkJoin([this.addPersonalInfoInquiry(benPrimaryIdNumber!, expiryDateString!),
      this.addAddressInfoInquiry(benPrimaryIdNumber!, expiryDateString!)])
      .pipe(
        map(([person, address]) => {
          const gender = genders.find((gender) => gender.enName.toLowerCase() === person.sex.trim().toLowerCase())?.lookupKey;
          return new Beneficiary().clone({
            arName: person.arabicName,
            enName: person.englishName,
            phoneNumber1: address.mobileNum,
            buildingName: address.buildingNum,
            streetName: address.streetNum,
            zone: address.zoneNum,
            unit: address.unitNum,
            addressDescription: address.addressDesc,
            benPrimaryIdNationality: criteria.benPrimaryIdNationality,
            benPrimaryIdNumber: criteria.benPrimaryIdNumber,
            benPrimaryIdType: criteria.benPrimaryIdType,
            expiryDate: criteria.expiryDate,
            dateOfBirth: person.birthDate,
            gender: gender
          });
        }),
        map((beneficiary) => [beneficiary]),
        catchError(_ => of([]))
      );
  }

  downloadQCBReport(gdxServiceLogId: number) {
    return this.http.get(this._getGDXServiceURL() + '/qcb/download-report/' + gdxServiceLogId, {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  @HasInterception
  @CastResponse(undefined, {
    fallback: '$reportAuditPagination'
  })
  reportAudit(@InterceptParam(reportAuditCriteriaInterceptor.send) criteria: ReportAuditCriteria): Observable<Pagination<ReportAuditResult[]>> {
    return this.http.post<Pagination<ReportAuditResult[]>>(this._getGDXServiceURL() + '/report/audit', criteria);
  }

  @HasInterception
  exportReportAudit(@InterceptParam() criteria: ReportAuditCriteria) {
    return this.http.post(this._getGDXServiceURL() + '/report/audit/export', criteria, {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }
}
