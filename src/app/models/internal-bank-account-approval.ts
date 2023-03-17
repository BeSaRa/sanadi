import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { CaseModel } from '@app/models/case-model';
import { InternalBankAccountApprovalService } from '@app/services/internal-bank-account-approval.service';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { FactoryService } from '@app/services/factory.service';
import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { CaseTypes } from '@app/enums/case-types.enum';
import { BankAccount } from '@app/models/bank-account';
import { NpoEmployee } from '@app/models/npo-employee';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { InternalBankAccountApprovalInterceptor } from '@app/model-interceptors/internal-bank-account-approval-interceptor';
import { InterceptModel } from '@decorators/intercept-model';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@helpers/date-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';

const _RequestType = mixinRequestType(CaseModel);

const { send, receive } = new InternalBankAccountApprovalInterceptor();
@InterceptModel({ send, receive })
export class InternalBankAccountApproval extends _RequestType<InternalBankAccountApprovalService, InternalBankAccountApproval> implements HasRequestType {
  caseType: number = CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL;
  serviceSteps!: string[];
  organizationId!: number;
  operationType?: number;
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
  internalBankAccountDTOs: BankAccount[] = [];
  selectedBankAccountToMerge!: BankAccount;
  operationTypeInfo!: AdminResult;
  bankCategoryInfo!: AdminResult;
  mainAccountInfo!: AdminResult;
  currencyInfo!: AdminResult;
  bankInfo!: AdminResult;
  followUpDate!: string;
  isUpdatedNewAccount!: boolean;
  ownerOfMergedBankAccounts!: number;

  service!: InternalBankAccountApprovalService;

  searchFields: ISearchFieldsMap<InternalBankAccountApproval> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'ouInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  constructor() {
    super();
    this.service = FactoryService.getService('InternalBankAccountApprovalService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const { oldLicenseFullSerial, requestType, operationType, purpose, bankId, category,
      currency, mainAccount, accountNumber, iBan, swiftCode, selectedBankAccountToMerge,
      ownerOfMergedBankAccounts, selectedResponsiblePerson } = this;
    return {
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      operationType: controls ? [operationType, [CustomValidators.required]] : operationType,
      purpose: controls ? [purpose, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : purpose,
      bankId: controls ? [bankId, [CustomValidators.required]] : bankId,
      category: controls ? [category, [CustomValidators.required]] : category,
      currency: controls ? [currency, [CustomValidators.required]] : currency,
      mainAccount: controls ? [mainAccount] : mainAccount,
      accountNumber: controls ? [accountNumber, [CustomValidators.number, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : accountNumber,
      iBan: controls ? [iBan, [CustomValidators.pattern('ENG_NUM_ONLY'), CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : iBan,
      swiftCode: controls ? [swiftCode, [CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.SWIFT_CODE_MIN)]] : swiftCode,
      selectedBankAccountToMerge: controls ? [selectedBankAccountToMerge] : selectedBankAccountToMerge,
      ownerOfMergedBankAccounts: controls ? [ownerOfMergedBankAccounts] : ownerOfMergedBankAccounts,
      selectedResponsiblePerson: controls ? [selectedResponsiblePerson] : selectedResponsiblePerson
    }
  }

  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : description,
    }
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

}
