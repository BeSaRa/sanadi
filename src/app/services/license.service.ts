import { ExternalOrgAffiliationResult } from './../models/external-org-affiliation-result';
import { ExternalOrgAffiliationSearchCriteria } from './../models/external-org-affiliation-search-criteria';
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FactoryService} from "@app/services/factory.service";
import {Observable, of} from "rxjs";
import {InitialExternalOfficeApprovalResult} from "@app/models/initial-external-office-approval-result";
import {UrlService} from "@app/services/url.service";
import {Generator} from "@app/decorators/generator";
import {
  InitialExternalOfficeApprovalSearchCriteria
} from "@app/models/initial-external-office-approval-search-criteria";
import {EmployeeService} from "@app/services/employee.service";
import {InitialApprovalDocumentInterceptor} from "@app/model-interceptors/initial-approval-document-interceptor";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DialogService} from "@app/services/dialog.service";
import {SelectLicensePopupComponent} from "@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component";
import {FinalExternalOfficeApprovalSearchCriteria} from '@app/models/final-external-office-approval-search-criteria';
import {catchError, map} from "rxjs/operators";
import {BlobModel} from "@app/models/blob-model";
import {DomSanitizer} from "@angular/platform-browser";
import {CaseTypes} from "@app/enums/case-types.enum";
import {PartnerApproval} from "@app/models/partner-approval";
import {PartnerApprovalInterceptor} from "@app/model-interceptors/partner-approval-interceptor";
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {
  FinalExternalOfficeApprovalResultInterceptor
} from '@app/model-interceptors/final-external-office-approval-result-interceptor';
import {FinalExternalOfficeApproval} from '@app/models/final-external-office-approval';
import {InitialExternalOfficeApproval} from '@app/models/initial-external-office-approval';
import {
  InitialExternalOfficeApprovalInterceptor
} from '@app/model-interceptors/initial-external-office-approval-interceptor';
import {
  FinalExternalOfficeApprovalInterceptor
} from '@app/model-interceptors/final-external-office-approval-interceptor';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {InternalProjectLicenseSearchCriteria} from '@app/models/internal-project-license-search-criteria';
import {
  InternalProjectLicenseResultInterceptor
} from '@app/model-interceptors/internal-project-license-result-interceptor';
import {InternalProjectLicense} from '@app/models/internal-project-license';
import {InternalProjectLicenseInterceptor} from '@app/model-interceptors/internal-project-license-interceptor';
import {PartnerApprovalSearchCriteria} from '@app/models/PartnerApprovalSearchCriteria';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {GeneralInterceptor} from '@app/model-interceptors/general-interceptor';
import {Fundraising} from '@app/models/fundraising';
import {FundraisingInterceptor} from '@app/model-interceptors/fundraising-interceptor';
import {FundraisingSearchCriteria} from '@app/models/FundRaisingSearchCriteria';
import {UrgentInterventionLicenseResult} from '@app/models/urgent-intervention-license-result';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';
import {UrgentInterventionLicenseInterceptor} from '@app/model-interceptors/urgent-intervention-license-interceptor';
import {UrgentInterventionLicenseSearchCriteria} from '@app/models/urgent-intervention-license-search-criteria';
import {
  UrgentInterventionLicenseResultInterceptor
} from '@app/model-interceptors/urgent-intervention-license-result-interceptor';
import {CollectionLicense} from "@app/license-models/collection-license";
import {CollectionLicenseInterceptor} from "@app/license-interceptors/collection-license-interceptor";
import {CollectorLicense} from '@app/license-models/collector-license';
import {CollectorLicenseInterceptor} from '@app/license-interceptors/collector-license-interceptor';
import {InternalBankAccountLicense} from '@app/license-models/internal-bank-account-license';
import {
  InternalBankAccountLicenseInterceptor
} from '@app/license-interceptors/internal-bank-account-license-interceptor';
import {HasInterception, InterceptionContainer, InterceptParam} from "@decorators/intercept-model";
import {CollectionApprovalInterceptor} from "@app/model-interceptors/collection-approval-interceptor";
import {CollectorApprovalInterceptor} from "@app/model-interceptors/collector-approval-interceptor";
import {UrgentInterventionReportSearchCriteria} from '@app/models/urgent-intervention-report-search-criteria';
import {UrgentInterventionReportResult} from '@app/models/urgent-intervention-report-result';
import {
  UrgentInterventionReportResultInterceptor
} from '@app/model-interceptors/urgent-intervention-report-result-interceptor';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {UrgentInterventionReportInterceptor} from '@app/model-interceptors/urgent-intervention-report-interceptor';

const collectionInterceptor = new CollectionApprovalInterceptor()
const collectorInterceptor = new CollectorApprovalInterceptor()

@InterceptionContainer({
  validateMultiLicenseCollection: {
    1: collectionInterceptor.send
  },
  validateMultiLicenseCollector: {
    1: collectorInterceptor.send
  }
})
@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private http: HttpClient,
              public urlService: UrlService,
              private dialog: DialogService,
              public domSanitizer: DomSanitizer,
              private employeeService: EmployeeService) {
    FactoryService.registerService('LicenseService', this);
  }

  getServiceUrlByCaseType(caseType: number) {
    let url: string = '';
    switch (caseType) {
      case CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL:
        url = this.urlService.URLS.INITIAL_OFFICE_APPROVAL;
        break;
      case CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL:
        url = this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL;
        break;
      case CaseTypes.PARTNER_APPROVAL:
        url = this.urlService.URLS.E_PARTNER_APPROVAL;
        break;
      case CaseTypes.INTERNAL_PROJECT_LICENSE:
        url = this.urlService.URLS.INTERNAL_PROJECT_LICENSE;
        break;
      case CaseTypes.COLLECTION_APPROVAL:
        url = this.urlService.URLS.COLLECTION_APPROVAL;
        break;
      case CaseTypes.COLLECTOR_LICENSING:
        url = this.urlService.URLS.COLLECTOR_APPROVAL;
        break;
      case CaseTypes.FUNDRAISING_LICENSING:
        url = this.urlService.URLS.FUNDRAISING;
        break;
      case CaseTypes.URGENT_INTERVENTION_LICENSING:
        url = this.urlService.URLS.URGENT_INTERVENTION_LICENSE;
        break;
      case CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN:
        url = this.urlService.URLS.URGENT_JOINT_RELIEF_CAMPAIGN;
        break;
      case CaseTypes.URGENT_INTERVENTION_REPORTING:
        url = this.urlService.URLS.URGENT_INTERVENTION_REPORTING;
        break;
      case CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE:
        url = this.urlService.URLS.CUSTOMS_EXEMPTION_REMITTANCE;
        break;
      case CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL:
        url = this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL;
        break;
      case CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST:
        url = this.urlService.URLS.EXTERNAL_ORG_AFFILIATION_REQUEST;
        break;
    }
    return url;
  }

  @Generator(InitialExternalOfficeApprovalResult, true, {
    property: 'rs',
    interceptReceive: (new InitialApprovalDocumentInterceptor()).receive
  })
  private _initialLicenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria>): Observable<InitialExternalOfficeApprovalResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InitialExternalOfficeApprovalResult[]>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/license/search', {...criteria, ...orgId})
  }

  initialLicenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria>): Observable<InitialExternalOfficeApprovalResult[]> {
    return this._initialLicenseSearch(criteria);
  }

  @Generator(PartnerApproval, true, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  partnerApprovalLicenseSearch(criteria: Partial<PartnerApprovalSearchCriteria>): Observable<PartnerApproval[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<PartnerApproval[]>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/license/search', {...criteria, ...orgId})
  }

  @Generator(Fundraising, true, {
    property: "rs",
    interceptReceive: (new FundraisingInterceptor()).receive,
  })
  fundRaisingLicenseSearch(criteria: Partial<FundraisingSearchCriteria>): Observable<Fundraising[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined};
    return this.http.post<Fundraising[]>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + "/license/search", {...criteria, ...orgId});
  }

  @Generator(FinalExternalOfficeApprovalResult, true, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalResultInterceptor()).receive
  })
  private _finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<FinalExternalOfficeApprovalResult[]>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/license/search', {...criteria, ...orgId})
  }
  finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    return this._finalApprovalLicenseSearch(criteria);
  }
  @Generator(FinalExternalOfficeApprovalResult, true, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalResultInterceptor()).receive
  })
  private _externalOrgAffiliationSearchCriteria(criteria: Partial<ExternalOrgAffiliationSearchCriteria>): Observable<ExternalOrgAffiliationResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<ExternalOrgAffiliationResult[]>(this.getServiceUrlByCaseType(CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST) + '/license/search', {...criteria, ...orgId})
  }
  externalOrgAffiliationSearch(criteria: Partial<ExternalOrgAffiliationSearchCriteria>): Observable<ExternalOrgAffiliationResult[]> {
    return this._externalOrgAffiliationSearchCriteria(criteria);
  }
  @Generator(InternalProjectLicenseResult, true, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseResultInterceptor()).receive
  })
  private _internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InternalProjectLicenseResult[]>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/license/search', {...criteria, ...orgId})
  }

  internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    return this._internalProjectLicenseSearch(criteria);
  }

  @Generator(UrgentInterventionLicenseResult, true, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionLicenseResultInterceptor()).receive
  })
  private _urgentInterventionLicenseSearch(criteria: Partial<UrgentInterventionLicenseSearchCriteria>): Observable<UrgentInterventionLicenseResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<UrgentInterventionLicenseResult[]>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/license/search', {...criteria, ...orgId})
  }

  urgentInterventionLicenseSearch(criteria: Partial<UrgentInterventionLicenseSearchCriteria>): Observable<UrgentInterventionLicenseResult[]> {
    return this._urgentInterventionLicenseSearch(criteria);
  }

  @Generator(UrgentInterventionReportResult, true, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionReportResultInterceptor()).receive
  })
  private _urgentInterventionReportSearch(criteria: Partial<UrgentInterventionReportSearchCriteria>): Observable<UrgentInterventionReportResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<UrgentInterventionReportResult[]>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_REPORTING) + '/license/search', {...criteria, ...orgId})
  }

  urgentInterventionReportSearch(criteria: Partial<UrgentInterventionReportSearchCriteria>): Observable<UrgentInterventionReportResult[]> {
    return this._urgentInterventionReportSearch(criteria);
  }

  @Generator(InitialExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new InitialExternalOfficeApprovalInterceptor()).receive
  })
  private _loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.get<InitialExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this._loadInitialLicenseByLicenseId(licenseId);
  }

  @Generator(PartnerApproval, false, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  private _loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this.http.get<PartnerApproval>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this._loadPartnerLicenseByLicenseId(licenseId);
  }

  @Generator(FinalExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalInterceptor()).receive
  })
  private _loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this.http.get<FinalExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this._loadFinalLicenseByLicenseId(licenseId);
  }

  @Generator(InternalProjectLicense, false, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseInterceptor()).receive
  })
  private _loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this.http.get<InternalProjectLicense>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/license/' + licenseId + '/details');
  }

  loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this._loadInternalProjectLicenseByLicenseId(licenseId);
  }

  @Generator(Fundraising, false, {
    property: 'rs',
    interceptReceive: (new FundraisingInterceptor()).receive
  })
  private _loadFundraisingLicenseByLicenseId(licenseId: string): Observable<Fundraising> {
    return this.http.get<Fundraising>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + '/license/' + licenseId + '/details');
  }

  loadFundraisingLicenseByLicenseId(licenseId: string): Observable<Fundraising> {
    return this._loadFundraisingLicenseByLicenseId(licenseId);
  }

  @Generator(CollectorLicense, false, {
    property: 'rs',
    interceptReceive: (new CollectorLicenseInterceptor()).receive
  })
  private _validateCollectorLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.COLLECTOR_LICENSING) + '/draft/validate', {
      requestType,
      collectorItemList: [{
        oldLicenseId
      }]
    });
  }

  @Generator(InternalBankAccountLicense, false, {
    property: 'rs',
    interceptReceive: (new InternalBankAccountLicenseInterceptor()).receive
  })
  private _validateInternalBankAccountLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(UrgentInterventionLicense, false, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionLicenseInterceptor()).receive
  })
  private _loadUrgentInterventionLicenseByLicenseId(licenseId: string): Observable<UrgentInterventionLicense> {
    return this.http.get<UrgentInterventionLicense>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/license/' + licenseId + '/details');
  }

  loadUrgentInterventionLicenseByLicenseId(licenseId: string): Observable<UrgentInterventionLicense> {
    return this._loadUrgentInterventionLicenseByLicenseId(licenseId);
  }

  @Generator(UrgentInterventionReport, false, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionReportInterceptor()).receive
  })
  private _loadUrgentInterventionReportByLicenseId(licenseId: string): Observable<UrgentInterventionReport> {
    return this.http.get<UrgentInterventionReport>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_REPORTING) + '/license/' + licenseId + '/details');
  }

  loadUrgentInterventionReportByLicenseId(licenseId: string): Observable<UrgentInterventionReport> {
    return this._loadUrgentInterventionReportByLicenseId(licenseId);
  }

  @Generator(InitialExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new InitialExternalOfficeApprovalInterceptor()).receive
  })
  _validateInitialApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.post<InitialExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(PartnerApproval, false, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  _validatePartnerApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<PartnerApproval> {
    return this.http.post<PartnerApproval>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  _validateFinalExternalOfficeLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InitialExternalOfficeApproval | FinalExternalOfficeApproval> {
    let data: any = {
      requestType,
      oldLicenseId
    };
    if (requestType === ServiceRequestTypes.NEW) {
      data.initialLicenseId = oldLicenseId;
      delete data.oldLicenseId;
    }
    return this.http.post<IDefaultResponse<InitialExternalOfficeApproval | FinalExternalOfficeApproval>>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/draft/validate', data)
      .pipe(
        map((response) => {
          let finalResponse, receiveInterceptor;
          if (requestType === ServiceRequestTypes.NEW) {
            receiveInterceptor = (new InitialExternalOfficeApprovalInterceptor()).receive;
            finalResponse = response.rs as InitialExternalOfficeApproval;
            finalResponse = new InitialExternalOfficeApproval().clone({...finalResponse});
          } else {
            receiveInterceptor = (new FinalExternalOfficeApprovalInterceptor()).receive;
            finalResponse = response.rs as FinalExternalOfficeApproval;
            finalResponse = new FinalExternalOfficeApproval().clone({...finalResponse});
          }
          finalResponse = GeneralInterceptor.receive(finalResponse);
          finalResponse = receiveInterceptor(finalResponse);
          return finalResponse;
        })
      );
  }

  @Generator(InternalProjectLicense, false, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseInterceptor()).receive
  })
  _validateInternalProjectLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InternalProjectLicense> {
    return this.http.post<InternalProjectLicense>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(Fundraising, false, {
    property: 'rs',
    interceptReceive: (new FundraisingInterceptor()).receive
  })
  _validateFundraisingLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<Fundraising> {
    return this.http.post<Fundraising>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(UrgentInterventionLicense, false, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionLicenseInterceptor()).receive
  })
  _validateUrgentInterventionLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<UrgentInterventionLicense> {
    return this.http.post<UrgentInterventionLicense>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(UrgentInterventionReportResult, false, {
    property: 'rs',
    interceptReceive: (new UrgentInterventionReportResultInterceptor()).receive
  })
  _validateUrgentInterventionReportByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_REPORTING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(CollectionLicense, false, {
    property: 'rs',
    interceptReceive: (new CollectionLicenseInterceptor()).receive
  })
  private _validateCollectionLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.COLLECTION_APPROVAL) + '/draft/validate', {
      requestType,
      collectionItemList: [{
        oldLicenseId
      }]
    });
  }

  validateLicenseByRequestType<T>(caseType: CaseTypes, requestType: number, licenseId: string): Observable<InitialExternalOfficeApproval | PartnerApproval | FinalExternalOfficeApproval | InternalProjectLicense | UrgentInterventionLicense | T | undefined | Fundraising> {
    if (caseType === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateInitialApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.PARTNER_APPROVAL) {
      return this._validatePartnerApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateFinalExternalOfficeLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.INTERNAL_PROJECT_LICENSE) {
      return this._validateInternalProjectLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_LICENSING) {
      return this._validateUrgentInterventionLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_REPORTING) {
      return this._validateUrgentInterventionReportByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.COLLECTION_APPROVAL) {
      return this._validateCollectionLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.COLLECTOR_LICENSING) {
      return this._validateCollectorLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.FUNDRAISING_LICENSING) {
      return this._validateFundraisingLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL) {
      return this._validateInternalBankAccountLicenseByRequestType<T>(requestType, licenseId);
    }
    return of(undefined);
  }

  openSelectLicenseDialog<T>(licenses: (InitialExternalOfficeApprovalResult[] | PartnerApproval[] | ExternalOrgAffiliationResult[] | FinalExternalOfficeApprovalResult[] | InternalProjectLicenseResult[] | UrgentInterventionLicenseResult[] | T[]), caseRecord: any | undefined, select = true, displayedColumns: string[] = []): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select,
      caseRecord,
      displayedColumns
    });
  }

  showLicenseContent<T extends { id: string }>(license: T, caseType: number): Observable<BlobModel> {
    let url: string = this.getServiceUrlByCaseType(caseType);
    if (!url) {
      return of();
    }

    return this.http.get(url + '/license/' + license.id + '/content', {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  @Generator(CollectionLicense, true, {
    property: 'rs',
    interceptReceive: (new CollectionLicenseInterceptor).receive
  })
  private _collectionSearch<C>(model: Partial<C>): Observable<CollectionLicense[]> {
    return this.http.post<CollectionLicense[]>(this.getServiceUrlByCaseType(CaseTypes.COLLECTION_APPROVAL) + '/license/search', model)
  }

  collectionSearch<C>(model: Partial<C>): Observable<CollectionLicense[]> {
    return this._collectionSearch(model);
  }

  @Generator(CollectorLicense, true, {
    property: 'rs',
    interceptReceive: (new CollectorLicenseInterceptor).receive
  })
  private _collectorSearch<C>(model: Partial<C>): Observable<CollectorLicense[]> {
    return this.http.post<CollectorLicense[]>(this.getServiceUrlByCaseType(CaseTypes.COLLECTOR_LICENSING) + '/license/search', model)
  }

  collectorSearch<C>(model: Partial<C>): Observable<CollectorLicense[]> {
    return this._collectorSearch(model);
  }

  @Generator(InternalBankAccountLicense, true, {
    property: 'rs',
    interceptReceive: (new InternalBankAccountLicenseInterceptor).receive
  })
  private _internalBankAccountSearch<C>(model: Partial<C>): Observable<InternalBankAccountLicense[]> {
    return this.http.post<InternalBankAccountLicense[]>(this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL + '/license/search', model)
  }

  internalBankAccountSearch<C>(model: Partial<C>): Observable<InternalBankAccountLicense[]> {
    return this._internalBankAccountSearch(model);
  }

  @HasInterception
  validateMultiLicenseCollection<T>(caseType: number, @InterceptParam() model: T): Observable<any> {
    return this.http.post(this.getServiceUrlByCaseType(caseType) + '/draft/validate', model)
  }

  @HasInterception
  validateMultiLicenseCollector<T>(caseType: number, @InterceptParam() model: T): Observable<any> {
    return this.http.post(this.getServiceUrlByCaseType(caseType) + '/draft/validate', model)
  }
}
