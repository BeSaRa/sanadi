import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse, CastResponseContainer, } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { FinancialAnalysisInterceptor } from '@app/model-interceptors/financial-analysis-interceptor';
import { FileNetDocument } from '@app/models/file-net-document';
import { FinancialAnalysis } from '@app/models/financial-analysis';
import { FinancialAnalysisSearchCriteria } from '@app/models/financial-analysis-search-criteria';
import { FinancialReport } from '@app/models/financial-report';
import { Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';


@CastResponseContainer({
  $default: {
    model: () => FinancialAnalysis,
  },
})
@Injectable({
  providedIn: 'root',
})
export class FinancialAnalysisService extends BaseGenericEService<FinancialAnalysis> {
  constructor(
    private urlService: UrlService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    public dialog: DialogService,
    public http: HttpClient
  ) {
    super();
    FactoryService.registerService('FinancialAnalysisService', this);
  }

  searchColumns: string[] = [
    'fullSerial',
    'requestTypeInfo',
    'subject',
    'createdOn',
    'caseStatus',
    'ouInfo',
    'creatorInfo',
  ];

  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = [
    'licenseNumber',
    'actions',
  ];

  serviceKey: keyof ILanguageKeys = 'menu_financial_analysis';
  jsonSearchFile: string = 'financial_analysis.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<FinancialAnalysis> =
    new FinancialAnalysisInterceptor();

  _getInterceptor(): Partial<IModelInterceptor<FinancialAnalysis>> {
    return this.interceptor;
  }

  _getModel(): any {
    return FinancialAnalysis;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.FINANCIAL_ANALYSIS;
  }
  _getFinancialReportURLSegment(): string {
    return this.urlService.URLS.FINANCIAL_REPORT;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'FinancialAnalysisComponent';
  }

  getSearchCriteriaModel<S extends FinancialAnalysis>(): FinancialAnalysis {
    return new FinancialAnalysisSearchCriteria();
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getReportTypes(reportPeriodicity: number, profileType: number): Observable<FinancialReport[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('reportPeriodicity', reportPeriodicity);
    queryParams = queryParams.append('profileType', profileType);

    return this.http.get<FinancialReport[]>(this._getFinancialReportURLSegment() + '/criteria',
      { params: queryParams })
      .pipe(catchError(() => of([] as FinancialReport[])));
  }
  licenseSearch(profileType: number): Observable<FinancialAnalysis[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('profileType', profileType);

    return this.http.get<any>(this._getURLSegment() + '/search', {
      params: queryParams
    })
      .pipe(
        map(result => result.rs as string[]),
        map(list => list.map(x => new FinancialAnalysis().clone({
          fullSerial: x
        })))
      )

  }

  addReport(caseId: string, document: FileNetDocument, reportType: number): Observable<FileNetDocument> {
    return this._saveDocument(caseId, document, reportType);
  }
  @CastResponse(() => FileNetDocument, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _saveDocument(caseId: string, document: FileNetDocument, reportType: number, progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {
    const clonedDocument = document.clone() as Partial<FileNetDocument>;
    const content = clonedDocument.files?.item(0);
    const formData = new FormData();
    delete clonedDocument.files;
    delete clonedDocument.dialog;
    delete clonedDocument.searchFields;
    delete clonedDocument.employeeService;
    delete clonedDocument.attachmentTypeInfo;
    delete clonedDocument.createdOn;
    delete clonedDocument.creatorInfo;
    delete clonedDocument.ouInfo;
    delete clonedDocument.required;
    delete clonedDocument.langService;

    clonedDocument.denormalizeItemId && clonedDocument.denormalizeItemId();

    delete clonedDocument.gridName
    if (!clonedDocument.description) {
      delete clonedDocument.description;
    }
    content ? formData.append('content', content) : null;
    formData.append('reportType', `${reportType}`);
    let requestUrl = this._getURLSegment() + '/' + caseId + '/report';

    return this.http.post<FileNetDocument>(requestUrl, formData, {
      params: new HttpParams({ fromObject: clonedDocument as any }),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(event => {
        if (event.type === HttpEventType.UploadProgress && progressCallback && typeof event.total !== 'undefined') {
          progressCallback(Math.floor(event.loaded * 100 / event.total));
        }
        return event.type === HttpEventType.Response;
      }),
      map<any, FileNetDocument>((response: any) => {
        return document.clone(response.body.rs) as FileNetDocument;
      })
    );
  }
  // approve(model: FinancialAnalysis, action: WFResponseType): DialogRef {
  //   return this.dialog.show(FinancialAnalysisApprovePopupComponent, {
  //     model,
  //     action
  //   });
  // }
}
