import { Injectable } from '@angular/core';
import { FinalExternalOfficeApproval } from '../models/final-external-office-approval';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { HttpClient } from '@angular/common/http';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import {
  FinalExternalOfficeApprovalInterceptor
} from '../model-interceptors/final-external-office-approval-interceptor';
import { ActionLogService } from './action-log.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { FinalExternalOfficeApprovalSearchCriteria } from '../models/final-external-office-approval-search-criteria';
import { DomSanitizer } from '@angular/platform-browser';
import { CommentService } from './comment.service';
import { DocumentService } from './document.service';
import { RecommendationService } from './recommendation.service';
import { SearchService } from './search.service';
import { Observable } from 'rxjs';
import { BankBranch } from '@app/models/bank-branch';
import { ExecutiveManagement } from '@app/models/executive-management';
import { BankAccount } from '@app/models/bank-account';
import { BankAccountInterceptor } from '@app/model-interceptors/bank-account-interceptor';
import { ExecutiveManagementInterceptor } from '@app/model-interceptors/executive-management-interceptor';
import { BankBranchInterceptor } from '@app/model-interceptors/bank-branch-interceptor';
import { LicenseService } from '@app/services/license.service';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => FinalExternalOfficeApproval
  }
})
@Injectable({
  providedIn: 'root'
})
export class FinalExternalOfficeApprovalService extends BaseGenericEService<FinalExternalOfficeApproval> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'createdOn', 'caseStatus', 'ouInfo', 'creatorInfo'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<FinalExternalOfficeApproval> = new FinalExternalOfficeApprovalInterceptor();
  bankAccountInterceptor: IModelInterceptor<BankAccount> = new BankAccountInterceptor();
  executiveManagementInterceptor: IModelInterceptor<ExecutiveManagement> = new ExecutiveManagementInterceptor();
  bankBranchInterceptor: IModelInterceptor<BankBranch> = new BankBranchInterceptor();
  actionLogService: ActionLogService = new ActionLogService(this);
  jsonSearchFile: string = 'final_external_office_approval_search_form.json';
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  serviceKey: keyof ILanguageKeys = 'menu_final_external_office_approval';
  selectLicenseDisplayColumns = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'actions'];

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('FinalExternalOfficeApprovalService', this);
  }

  getCaseComponentName(): string {
    return 'FinalExternalOfficeApprovalComponent';
  }

  _getInterceptor(): Partial<IModelInterceptor<FinalExternalOfficeApproval>> {
    return this.interceptor;
  }

  _getModel() {
    return FinalExternalOfficeApproval;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL;
  }

  getSearchCriteriaModel<S extends FinalExternalOfficeApproval>(): FinalExternalOfficeApproval {
    return new FinalExternalOfficeApprovalSearchCriteria();
  }

  licenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria> = {}): Observable<FinalExternalOfficeApprovalResult[]> {
    return this.licenseService.finalApprovalLicenseSearch(criteria);
  }

}
