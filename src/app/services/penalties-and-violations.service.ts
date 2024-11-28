import { HttpClient, HttpEventType, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { PenaltiesAndViolationsInterceptor } from "@app/model-interceptors/penalties-and-violations-interceptor";
import { PenaltiesAndViolations } from "@app/models/penalties-and-violations";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { PenaltiesAndViolationsSearchCriteria } from "@app/models/penalties-and-violations-search-criteria";
import { FileNetDocument } from "@app/models/file-net-document";
import { catchError, filter, map, of } from "rxjs";

@CastResponseContainer({
    $default: {
      model: () => PenaltiesAndViolations,
    },
  })
  @Injectable({
    providedIn: 'root',
  })
  export class PenaltiesAndViolationsService extends BaseGenericEService<PenaltiesAndViolations> {
    constructor(
      private urlService: UrlService,
      public domSanitizer: DomSanitizer,
      public dynamicService: DynamicOptionsService,
      public dialog: DialogService,
      public http: HttpClient
    ) {
      super();
      FactoryService.registerService('PenaltiesAndViolationsService', this);
    }
  
    searchColumns: string[] = ['fullSerial', 'caseStatus', 'ouInfo',  'creatorInfo', 'createdOn',];

  
    selectLicenseDisplayColumns: string[] = [];
    selectLicenseDisplayColumnsReport: string[] = [
      'licenseNumber',
      'actions',
    ];
  
    serviceKey: keyof ILanguageKeys = 'menu_penalties_and_violations';
    jsonSearchFile: string = 'penalties_and_violations.json';
    caseStatusIconMap: Map<number, string> = new Map<number, string>();
    interceptor: IModelInterceptor<PenaltiesAndViolations> =
      new PenaltiesAndViolationsInterceptor();
  
    _getInterceptor(): Partial<IModelInterceptor<PenaltiesAndViolations>> {
      return this.interceptor;
    }
  
    _getModel(): any {
      return PenaltiesAndViolations;
    }
  
    _getURLSegment(): string {
      return this.urlService.URLS.PENALTIES_AND_VIOLATIONS;
    }
    
  
    _getUrlService(): UrlService {
      return this.urlService;
    }
  
    getCaseComponentName(): string {
      return 'PenaltiesAndViolationsComponent';
    }
  
    getSearchCriteriaModel<S extends PenaltiesAndViolations>(): PenaltiesAndViolations {
      return new PenaltiesAndViolationsSearchCriteria();
    }
    @CastResponse(undefined, {
      fallback: '$default',
      unwrap: 'rs'
    })
     uploadPenaltyBook(model: PenaltiesAndViolations, document: FileNetDocument) {
      const content = document.files?.item(0);
      const formData = new FormData();
      content ? formData.append('content', content) : null;
      let params:any = {
        caseId:model.getCaseId()
      }
      model.exportedLicenseId  && (params = {...params , docId:model.exportedLicenseId});
     
      return this.http.post<PenaltiesAndViolations>(this._getURLSegment() + '/report', formData, {
        params: new HttpParams({fromObject: params}),
      
      })
      .pipe(catchError(_ => of(model)));
    }
  }
  