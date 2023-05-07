import { AdminResult } from '@app/models/admin-result';
import { SubventionAidService } from '@app/services/subvention-aid.service';
import { FactoryService } from '@app/services/factory.service';
import { SubventionRequestService } from '@app/services/subvention-request.service';
import { BeneficiaryService } from '@app/services/beneficiary.service';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { Observable, of } from 'rxjs';
import { InterceptModel } from "@decorators/intercept-model";
import { SanadiAuditResultInterceptor } from "@app/model-interceptors/sanadi-audit-result-interceptor";

const { send, receive } = new SanadiAuditResultInterceptor()

@InterceptModel({ send, receive })
export class SanadiAuditResult extends SearchableCloneable<SanadiAuditResult> {
  id!: number;
  auditId!: number;
  updatedOn!: string;
  operationInfo!: AdminResult;
  orgInfo!: AdminResult;
  userInfo!: AdminResult;
  statusDateModified!: string;
  statusInfo!: AdminResult;
  qId!: string;
  domainName!: string;
  clientIP!: string;

  //extra properties (to be deleted in interceptor)
  subventionAidService: SubventionAidService;
  subventionRequestService: SubventionRequestService;
  beneficiaryService: BeneficiaryService;
  updatedOnString: string = '';
  statusDateModifiedString: string = '';
  auditEntity!: 'BENEFICIARY' | 'SUBVENTION_REQUEST' | 'SUBVENTION_AID';

  constructor() {
    super();
    this.subventionAidService = FactoryService.getService('SubventionAidService');
    this.subventionRequestService = FactoryService.getService('SubventionRequestService');
    this.beneficiaryService = FactoryService.getService('BeneficiaryService');
  }

  searchFields: ISearchFieldsMap<SanadiAuditResult> = {
    ...infoSearchFields(['orgInfo', 'userInfo', 'operationInfo']),
    ...normalSearchFields(['updatedOnString'])
  };

  showAuditDetails(): Observable<any> {
    if (this.auditEntity === 'SUBVENTION_AID') {
      return this.subventionAidService.loadSubventionAidAuditDetails(this.id);
    } else if (this.auditEntity === 'SUBVENTION_REQUEST') {
      return this.subventionRequestService.loadSubventionRequestAuditDetails(this.id);
    } else if (this.auditEntity === 'BENEFICIARY') {
      return this.beneficiaryService.loadBeneficiaryAuditDetails(this.id);
    }
    return of(null);
  }
}
