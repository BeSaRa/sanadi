import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FactoryService} from "@app/services/factory.service";
import {Observable, of} from "rxjs";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {UrlService} from "@app/services/url.service";
import {Generator} from "@app/decorators/generator";
import {InitialApprovalDocSearchCriteria} from "@app/models/initial-approval-doc-search-criteria";
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
import {FinalApprovalDocument} from '@app/models/final-approval-document';
import {FinalApprovalDocumentInterceptor} from '@app/model-interceptors/final-approval-document-interceptor';

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

  @Generator(InitialApprovalDocument, true, {
    property: 'rs',
    interceptReceive: (new InitialApprovalDocumentInterceptor()).receive
  })
  private _initialLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<InitialApprovalDocument[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InitialApprovalDocument[]>(this.urlService.URLS.INITIAL_OFFICE_APPROVAL + '/license/search', {...criteria, ...orgId})
  }

  initialLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<InitialApprovalDocument[]> {
    return this._initialLicenseSearch(criteria);
  }

  @Generator(PartnerApproval, true, {
    property: 'rs',
    interceptReceive: (new PartnerApprovalInterceptor()).receive
  })
  partnerApprovalLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<PartnerApproval[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<PartnerApproval[]>(this.urlService.URLS.E_PARTNER_APPROVAL + '/license/search', {...criteria, ...orgId})
  }


  @Generator(FinalApprovalDocument, true, {
    property: 'rs',
    interceptReceive: (new FinalApprovalDocumentInterceptor()).receive
  })
  private _finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalApprovalDocument[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<FinalApprovalDocument[]>(this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL + '/license/search', {...criteria, ...orgId})
  }

  finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalApprovalDocument[]> {
    return this._finalApprovalLicenseSearch(criteria);
  }

  openSelectLicenseDialog(licenses: (InitialApprovalDocument[] | PartnerApproval[] | FinalApprovalDocument[]), caseRecord: any | undefined, select = true): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select,
      caseRecord
    });
  }

  openLicenseFullContentDialog(blob: BlobModel, license: (InitialApprovalDocument | PartnerApproval | FinalApprovalDocument)): DialogRef {
    return this.dialog.show(ViewDocumentPopupComponent, {
      model: license,
      blob: blob
    }, {
      escToClose: true
    });
  }

  showLicenseContent(license: (InitialApprovalDocument | PartnerApproval | FinalApprovalDocument), caseType: number): Observable<BlobModel> {
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
