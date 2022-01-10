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
import {SelectLicensePopupComponent} from "@app/e-services/poups/select-license-popup/select-license-popup.component";
import {FinalExternalOfficeApprovalSearchCriteria} from '@app/models/final-external-office-approval-search-criteria';
import {catchError, map} from "rxjs/operators";
import {BlobModel} from "@app/models/blob-model";
import {DomSanitizer} from "@angular/platform-browser";
import {CaseTypes} from "@app/enums/case-types.enum";
import {ViewDocumentPopupComponent} from "@app/shared/popups/view-document-popup/view-document-popup.component";
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

  @Generator(InitialExternalOfficeApprovalResult, true, {
    property: 'rs',
    interceptReceive: (new InitialApprovalDocumentInterceptor()).receive
  })
  private _initialLicenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria>): Observable<InitialExternalOfficeApprovalResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InitialExternalOfficeApprovalResult[]>(this.urlService.URLS.INITIAL_OFFICE_APPROVAL + '/license/search', {...criteria, ...orgId})
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
    return this.http.post<PartnerApproval[]>(this.urlService.URLS.E_PARTNER_APPROVAL + '/license/search', {...criteria, ...orgId})
  }


  @Generator(FinalExternalOfficeApprovalResult, true, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalResultInterceptor()).receive
  })
  private _finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<FinalExternalOfficeApprovalResult[]>(this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL + '/license/search', {...criteria, ...orgId})
  }

  finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    return this._finalApprovalLicenseSearch(criteria);
  }

  @Generator(InternalProjectLicenseResult, true, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseResultInterceptor()).receive
  })
  private _internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InternalProjectLicenseResult[]>(this.urlService.URLS.INTERNAL_PROJECT_LICENSE + '/license/search', {...criteria, ...orgId})
  }

  internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    return this._internalProjectLicenseSearch(criteria);
  }

  @Generator(InitialExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new InitialExternalOfficeApprovalInterceptor()).receive
  })
  private _loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.get<InitialExternalOfficeApproval>(this.urlService.URLS.INITIAL_OFFICE_APPROVAL + '/license/' + licenseId + '/details');
  }

  loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this._loadInitialLicenseByLicenseId(licenseId);
  }

  @Generator(PartnerApproval, false, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  private _loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this.http.get<PartnerApproval>(this.urlService.URLS.E_PARTNER_APPROVAL + '/license/' + licenseId + '/details');
  }

  loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this._loadPartnerLicenseByLicenseId(licenseId);
  }

  @Generator(FinalExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalInterceptor()).receive
  })
  private _loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this.http.get<FinalExternalOfficeApproval>(this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL + '/license/' + licenseId + '/details');
  }

  loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this._loadFinalLicenseByLicenseId(licenseId);
  }

  @Generator(InternalProjectLicense, false, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseInterceptor()).receive
  })
  private _loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this.http.get<InternalProjectLicense>(this.urlService.URLS.INTERNAL_PROJECT_LICENSE + '/license/' + licenseId + '/details');
  }

  loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this._loadInternalProjectLicenseByLicenseId(licenseId);
  }

  @Generator(InitialExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new InitialExternalOfficeApprovalInterceptor()).receive
  })
  _validateInitialApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.post<InitialExternalOfficeApproval>(this.urlService.URLS.INITIAL_OFFICE_APPROVAL + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(PartnerApproval, false, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  _validatePartnerApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<PartnerApproval> {
    return this.http.post<PartnerApproval>(this.urlService.URLS.E_PARTNER_APPROVAL + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @Generator(FinalExternalOfficeApproval, false, {
    property: 'rs',
    interceptReceive: (new FinalExternalOfficeApprovalInterceptor()).receive
  })
  _validateFinalExternalOfficeLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<FinalExternalOfficeApproval> {
    let data: any = {
      requestType,
      oldLicenseId
    };
    if (requestType === ServiceRequestTypes.NEW) {
      data.initialLicenseId = oldLicenseId;
      delete data.oldLicenseId;
    }
    return this.http.post<FinalExternalOfficeApproval>(this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL + '/draft/validate', data);
  }

  @Generator(InternalProjectLicense, false, {
    property: 'rs',
    interceptReceive: (new InternalProjectLicenseInterceptor()).receive
  })
  _validateInternalProjectLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InternalProjectLicense> {
    return this.http.post<InternalProjectLicense>(this.urlService.URLS.INTERNAL_PROJECT_LICENSE + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  validateLicenseByRequestType(caseType: CaseTypes, requestType: number, licenseId: string): Observable<InitialExternalOfficeApproval | PartnerApproval | FinalExternalOfficeApproval | InternalProjectLicense | undefined> {
    if (caseType === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateInitialApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.PARTNER_APPROVAL) {
      return this._validatePartnerApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateFinalExternalOfficeLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.INTERNAL_PROJECT_LICENSE) {
      return this._validateInternalProjectLicenseByRequestType(requestType, licenseId);
    }
    return of(undefined);
  }

  openSelectLicenseDialog(licenses: (InitialExternalOfficeApprovalResult[] | PartnerApproval[] | FinalExternalOfficeApprovalResult[] | InternalProjectLicenseResult[]), caseRecord: any | undefined, select = true, displayedColumns: string[] = []): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select,
      caseRecord,
      displayedColumns
    });
  }

  openLicenseFullContentDialog(blob: BlobModel, license: (InitialExternalOfficeApprovalResult | PartnerApproval | FinalExternalOfficeApprovalResult | InternalProjectLicenseResult)): DialogRef {
    return this.dialog.show(ViewDocumentPopupComponent, {
      model: license,
      blob: blob
    }, {
      escToClose: true
    });
  }

  showLicenseContent(license: (InitialExternalOfficeApprovalResult | PartnerApproval | FinalExternalOfficeApprovalResult | InternalProjectLicenseResult), caseType: number): Observable<BlobModel> {
    let url!: string;

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
    }

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
}
