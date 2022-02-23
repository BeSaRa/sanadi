import {AdminResult} from '@app/models/admin-result';
import {SubventionAidService} from '@app/services/subvention-aid.service';
import {FactoryService} from '@app/services/factory.service';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {BeneficiaryService} from '@app/services/beneficiary.service';

export class SanadiAuditResult {
  id!: number;
  auditId!: number;
  updatedOn!: string;
  operationInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
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
    this.subventionAidService = FactoryService.getService('SubventionAidService');
    this.subventionRequestService = FactoryService.getService('SubventionRequestService');
    this.beneficiaryService = FactoryService.getService('BeneficiaryService');
  }

  showAuditDetails($event: MouseEvent): any {
    $event?.preventDefault();
    if (this.auditEntity === 'SUBVENTION_AID') {
      return this.subventionAidService.loadSubventionAidAuditDetails(this.id);
    } else if (this.auditEntity === 'SUBVENTION_REQUEST') {
      return this.subventionRequestService.loadSubventionRequestAuditDetails(this.id);
    } else {
      return this.beneficiaryService.loadBeneficiaryAuditDetails(this.id);
    }
  }
}
