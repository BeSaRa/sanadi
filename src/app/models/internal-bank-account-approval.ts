import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {CaseModel} from '@app/models/case-model';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {HasRequestType} from '@app/interfaces/has-request-type';
import {FactoryService} from '@app/services/factory.service';
import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {CaseTypes} from '@app/enums/case-types.enum';
import {BankAccount} from '@app/models/bank-account';
import {NpoEmployee} from '@app/models/npo-employee';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';

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
  bankAccountExecutiveManagementDTOs!: NpoEmployee[];
  selectedResponsiblePerson!: NpoEmployee;
  description!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  licenseVSID!: string;
  subject!: string;
  internalBankAccountDTO: BankAccount[] = [];
  selectedBankAccountToMerge!: BankAccount;
  operationTypeInfo!: AdminResult;
  bankCategoryInfo!: AdminResult;
  mainAccountInfo!: AdminResult;
  currencyInfo!: AdminResult;
  followUpDate!: string;

  service!: InternalBankAccountApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('InternalBankAccountApprovalService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const {oldLicenseFullSerial, requestType, operationType, purpose, bankId, category,
      currency, mainAccount, accountNumber, iBan, swiftCode, selectedBankAccountToMerge, selectedResponsiblePerson} = this;
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
      swiftCode: controls ? [swiftCode] : swiftCode,
      selectedBankAccountToMerge: controls ? [selectedBankAccountToMerge] : selectedBankAccountToMerge,
      selectedResponsiblePerson: controls ? [selectedResponsiblePerson] : selectedResponsiblePerson
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.required]] : description,
    }
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }
}
