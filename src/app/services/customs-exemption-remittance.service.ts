import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import {
  CustomsExemptionRemittanceInterceptor
} from '@app/model-interceptors/customs-exemption-remittance-interceptor';
import { CustomsExemptionRemittance } from '@app/models/customs-exemption-remittance';
import { CustomsExemptionSearchCriteria } from '@app/models/customs-exemption-search-criteria';
import { Observable, of } from 'rxjs';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { BlobModel } from '@app/models/blob-model';
import { catchError, map } from 'rxjs/operators';
import { CaseTypes } from '@app/enums/case-types.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import {
  SelectDocumentPopUpComponent
} from '@app/modules/services/customs-exemption-remittance/popups/select-document-pop-up/select-document-pop-up.component';
import { AdminResult } from '@app/models/admin-result';
import { CustomsExemptionRequestTypes } from '@app/enums/service-request-types';
import { CommonService } from '@services/common.service';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => CustomsExemptionRemittance
  }
})
@Injectable({
  providedIn: 'root',
})
export class CustomsExemptionRemittanceService extends BaseGenericEService<CustomsExemptionRemittance> {
  jsonSearchFile: string = 'customs_exemption_search_form.json';
  interceptor: IModelInterceptor<CustomsExemptionRemittance> = new CustomsExemptionRemittanceInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_customs_exemption_service';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'creatorInfo', 'caseStatus', 'createdOn'];
  selectDocumentDisplayColumns: string[] = ['shipmentSource', 'shipmentCarrier', 'receiverName', 'orderNumber', 'documentNumber', 'actions'];

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              private commonService: CommonService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('CustomsExemptionRemittanceService', this);
  }

  _getModel() {
    return CustomsExemptionRemittance;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.CUSTOMS_EXEMPTION_REMITTANCE;
  }

  _getInterceptor(): Partial<IModelInterceptor<CustomsExemptionRemittance>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends CustomsExemptionRemittance>(): CustomsExemptionRemittance {
    return new CustomsExemptionSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'CustomsExemptionComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  @CastResponse(undefined)
  private _customExemptionDocumentSearch(criteria: Partial<CustomsExemptionSearchCriteria>): Observable<CustomsExemptionRemittance[]> {
    const orgId = {organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined};
    let url = this._getURLSegment() + '/search';
    // if (criteria.requestType === CustomsExemptionRequestTypes.CANCEL) {
    //   url += '/approved';
    // }
    delete criteria.requestType; // it was added to check the request type to distinguish between requests
    return this.http.post<CustomsExemptionRemittance[]>(url, {...criteria, ...orgId});
  }

  documentSearch(criteria: Partial<CustomsExemptionSearchCriteria> = {}): Observable<CustomsExemptionRemittance[]> {
    return this._customExemptionDocumentSearch(criteria);
  }

  showDocumentContent<T extends { bookId: string }>(document: T, _caseType: number): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/document/' + document.bookId + '/download', {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  @CastResponse(undefined)
  _validateDocumentByRequestType(requestType: number, exportedBookId: string): Observable<CustomsExemptionRemittance> {
    return this.http.post<CustomsExemptionRemittance>(this._getURLSegment() + '/draft/validate', {
      requestType,
      exportedBookId
    });
  }

  validateDocumentByRequestType<T>(caseType: CaseTypes, requestType: number, exportedBookId: string): Observable<T | undefined | CustomsExemptionRemittance> {
    return this._validateDocumentByRequestType(requestType, exportedBookId);
  }


  openSelectDocumentDialog<T>(documents: T[], caseRecord: any | undefined, select = true, displayedColumns: string[] = []): DialogRef {
    return this.dialog.show(SelectDocumentPopUpComponent, {
      documents,
      select,
      caseRecord,
      displayedColumns,
    });
  }

  loadReceiverNames(type: number, country: number): Observable<AdminResult[]> {
    return this.commonService.loadAgenciesByAgencyTypeAndCountry(type, country);
  }
}
