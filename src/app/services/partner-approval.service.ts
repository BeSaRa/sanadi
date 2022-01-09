import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {EServiceGenericService} from "../generics/e-service-generic-service";
import {PartnerApproval} from "../models/partner-approval";
import {ActionLogService} from './action-log.service';
import {CommentService} from "./comment.service";
import {DialogService} from "./dialog.service";
import {DocumentService} from "./document.service";
import {DomSanitizer} from "@angular/platform-browser";
import {DynamicOptionsService} from "./dynamic-options.service";
import {HttpClient} from "@angular/common/http";
import {IModelInterceptor} from "../interfaces/i-model-interceptor";
import {RecommendationService} from "./recommendation.service";
import {SearchService} from "./search.service";
import {ILanguageKeys} from "../interfaces/i-language-keys";
import {FactoryService} from "./factory.service";
import {UrlService} from "./url.service";
import {CaseStatus} from "../enums/case-status.enum";
import {PartnerApprovalInterceptor} from "../model-interceptors/partner-approval-interceptor";
import {Observable} from "rxjs";
import {LicenseService} from "@app/services/license.service";
import {BankAccount} from "@app/models/bank-account";
import {BankAccountInterceptor} from "@app/model-interceptors/bank-account-interceptor";
import {ExecutiveManagement} from "@app/models/executive-management";
import {ExecutiveManagementInterceptor} from "@app/model-interceptors/executive-management-interceptor";
import {PartnerApprovalSearchCriteria} from "@app/models/PartnerApprovalSearchCriteria";
import {Goal} from "@app/models/goal";
import {ManagementCouncil} from "@app/models/management-council";
import {TargetGroup} from "@app/models/target-group";
import {ContactOfficer} from "@app/models/contact-officer";
import {ApprovalReason} from "@app/models/approval-reason";
import {GoalInterceptor} from "@app/model-interceptors/GoalInterceptor";
import {ManagementCouncilInterceptor} from "@app/model-interceptors/ManagementCouncilInterceptor";
import {TargetGroupInterceptor} from "@app/model-interceptors/TargetGroupInterceptor";
import {ContactOfficerInterceptor} from "@app/model-interceptors/ContactOfficerInterceptor";
import {ApprovalReasonInterceptor} from "@app/model-interceptors/ApprovalReasonInterceptor";

@Injectable({
  providedIn: 'root'
})
export class PartnerApprovalService extends EServiceGenericService<PartnerApproval> {
  actionLogService: ActionLogService = new ActionLogService(this);
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  interceptor: IModelInterceptor<PartnerApproval> = new PartnerApprovalInterceptor();
  bankAccountInterceptor: IModelInterceptor<BankAccount> = new BankAccountInterceptor();
  goalInterceptor: IModelInterceptor<Goal> = new GoalInterceptor();
  managementCouncilInterceptor: IModelInterceptor<ManagementCouncil> = new ManagementCouncilInterceptor();
  executiveManagementInterceptor: IModelInterceptor<ExecutiveManagement> = new ExecutiveManagementInterceptor();
  targetGroupInterceptor: IModelInterceptor<TargetGroup> = new TargetGroupInterceptor();
  contactOfficerInterceptor: IModelInterceptor<ContactOfficer> = new ContactOfficerInterceptor();
  approvalReasonInterceptor: IModelInterceptor<ApprovalReason> = new ApprovalReasonInterceptor();
  jsonSearchFile: string = 'partner_approval_search_form.json';
  searchColumns: string[] = ['fullSerial', 'subject', 'createdOn', 'caseStatus', 'ouInfo', 'countryInfo', 'requestClassificationInfo', 'creatorInfo'];
  serviceKey: keyof ILanguageKeys = "menu_partner_approval";
  selectLicenseDisplayColumns = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'actions'];

  caseStatusIconMap: Map<number, string> = new Map<number, string>([
    [CaseStatus.CANCELLED, 'mdi mdi-cancel'],
    [CaseStatus.DRAFT, 'mdi mdi-notebook-edit-outline'],
    [CaseStatus.CREATED, 'mdi mdi-file-star-outline'],
    [CaseStatus.STARTED, 'mdi mdi-rocket-launch'],
  ]);

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('PartnerApprovalService', this);
  }

  _getInterceptor(): Partial<IModelInterceptor<PartnerApproval>> {
    return this.interceptor;
  }

  _getModel(): any {
    return PartnerApproval;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.E_PARTNER_APPROVAL;
  }

  getCaseComponentName(): string {
    return "PartnerApprovalComponent";
  }

  getSearchCriteriaModel<S extends PartnerApproval>(): PartnerApproval {
    return new PartnerApprovalSearchCriteria();
  }

  licenseSearch(criteria: Partial<PartnerApprovalSearchCriteria> = {}): Observable<PartnerApproval[]> {
    return this.licenseService.partnerApprovalLicenseSearch(criteria);
  }
}
