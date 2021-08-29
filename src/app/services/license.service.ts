import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FactoryService} from "@app/services/factory.service";
import {Observable} from "rxjs";
import {InitialApprovalDocument} from "@app/models/initial-approval-document";
import {UrlService} from "@app/services/url.service";
import {Generator} from "@app/decorators/generator";
import {InitialApprovalDocSearchCriteria} from "@app/models/initial-approval-doc-search-criteria";

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private http: HttpClient, public urlService: UrlService) {
    FactoryService.registerService('LicenseService', this);
  }

  @Generator(InitialApprovalDocument, true)
  private _initialLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<InitialApprovalDocument[]> {
    return this.http.post<InitialApprovalDocument[]>(this.urlService.URLS.INITIAL_OFFICE_APPROVAL + '/license/search', criteria)
  }

  initialLicenseSearch(criteria: Partial<InitialApprovalDocSearchCriteria>): Observable<InitialApprovalDocument[]> {
    return this._initialLicenseSearch(criteria);
  }

}
