import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {CaseModel} from '@app/models/case-model';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {HasRequestType} from '@app/interfaces/has-request-type';
import {FactoryService} from '@app/services/factory.service';
import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {CaseTypes} from '@app/enums/case-types.enum';

const _RequestType = mixinRequestType(CaseModel);

export class InternalBankAccountApproval extends _RequestType<InternalBankAccountApprovalService, InternalBankAccountApproval> implements HasRequestType {
  caseType: number = CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL;
  serviceSteps!: string[];
  organizationId!: number;
  operationType!: number;
  purpose!: string;
  bankId!: number;
  category!: number;
  mainAccount!: number;
  currency!: number;
  accountNumber!: string;
  iBan!: string;
  swiftCode!: string;
  bankDTOs!: string;
  bankAccountExecutiveManagementDTOs!: number[];
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

  buildBasicInfo(controls: boolean = false): any {
    const {oldLicenseFullSerial, requestType, operationType, purpose, bankId, category, currency, mainAccount, accountNumber, iBan, swiftCode} = this;
    return {
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      operationType: controls ? [operationType, [CustomValidators.required]] : operationType,
      purpose: controls ? [purpose, [CustomValidators.required]] : purpose,
      bankId: controls ? [bankId, [CustomValidators.required]] : bankId,
      category: controls ? [category, [CustomValidators.required]] : category,
      currency: controls ? [currency, [CustomValidators.required]] : currency,
      mainAccount: controls ? [mainAccount] : mainAccount,
      accountNumber: controls ? [accountNumber] : accountNumber,
      iBan: controls ? [iBan] : iBan,
      swiftCode: controls ? [swiftCode] : swiftCode
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.required]] : description,
    }
  }
}
