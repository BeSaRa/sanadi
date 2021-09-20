import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FactoryService} from "@app/services/factory.service";
import {Observable} from "rxjs";
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

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private http: HttpClient,
              public urlService: UrlService,
              private dialog: DialogService,
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

  partnerApprovalLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<InitialApprovalDocument[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InitialApprovalDocument[]>(this.urlService.URLS.E_PARTNER_APPROVAL + '/license/search', {...criteria, ...orgId})
  }


  @Generator(InitialApprovalDocument, true, {
    property: 'rs',
    interceptReceive: (new InitialApprovalDocumentInterceptor()).receive
  })
  private _finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<InitialApprovalDocument[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : undefined}
    return this.http.post<InitialApprovalDocument[]>(this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL + '/license/search', {...criteria, ...orgId})
  }
  finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<InitialApprovalDocument[]> {
    return this._finalApprovalLicenseSearch(criteria);
  }

  openSelectLicenseDialog(licenses: InitialApprovalDocument[], select = true): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select
    });
  }
}
