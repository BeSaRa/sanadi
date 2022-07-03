import { ExecutiveManagement } from '@app/models/executive-management';
import { ContactOfficer } from '@app/models/contact-officer';
import { BankAccount } from '@app/models/bank-account';
import { FactoryService } from './../services/factory.service';
import { ExternalOrgAffiliationInterceptor } from './../model-interceptors/external-org-affiliation-interceptor';
import { CaseTypes } from './../enums/case-types.enum';
import { ExternalOrgAffiliationService } from './../services/external-org-affiliation.service';
import { HasRequestType } from './../interfaces/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { InterceptModel } from '@decorators/intercept-model';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new ExternalOrgAffiliationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class ExternalOrgAffiliation extends _RequestType<ExternalOrgAffiliationService, ExternalOrgAffiliation> implements  HasRequestType {
  service: ExternalOrgAffiliationService;
  caseType: number = CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST;

  requestType!: number;
  category!: number;
  arName!: string;
  enName!: string
  country!: number;
  city!: string;
  phone!: string;
  fax!: string;
  website!: string;
  email!: string;
  mailBox!: string;
  description!: string;

  bankAccountDTOs: BankAccount[] = [];
  executiveManagementDTOs: ExecutiveManagement[] = [];
  contactOfficerDTOs: ContactOfficer[] = [];

  constructor() {
    super();
    this.service = FactoryService.getService('CollectionApprovalService');
  }

}
