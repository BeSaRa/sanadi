import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {CaseModel} from '@app/models/case-model';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {HasRequestType} from '@app/interfaces/has-request-type';
import {FactoryService} from '@app/services/factory.service';
import {AdminResult} from '@app/models/admin-result';

const _RequestType = mixinRequestType(CaseModel);

export class InternalBankAccountApproval extends _RequestType<InternalBankAccountApprovalService, InternalBankAccountApproval> implements HasRequestType {
  serviceSteps!: string[];
  organizationId!: number;
  operationType!: number;
  purpose!: string;
  bankName!: string;
  category!: number;
  mainAccount!: number;
  currency!: number;
  accountNumber!: string;
  getiBan!: string;
  swiftCode!: string;
  bankDTOs!: string;
  bankAccountExecutiveManagementDTOs!: string;
  description!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  licenseVSID!: string;
  subject!: string;
  operationTypeInfo!: AdminResult;
  bankCategoryInfo!: AdminResult;
  mainAccountInfo!: AdminResult;
  currencyInfo!: AdminResult;

  service!: InternalBankAccountApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('InternalBankAccountApprovalService');
  }
}
