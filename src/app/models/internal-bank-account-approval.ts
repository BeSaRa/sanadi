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
import {
  InternalBankAccountApprovalInterceptor
} from '@app/model-interceptors/internal-bank-account-approval-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@helpers/date-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ObjectUtils} from '@app/helpers/object-utils';
import {BankAccountRequestTypes} from "@enums/service-request-types";
import {BankAccountOperationTypes} from "@enums/bank-account-operation-types";
import {LangService} from "@services/lang.service";

const _RequestType = mixinRequestType(CaseModel);

const {send, receive} = new InternalBankAccountApprovalInterceptor();

@InterceptModel({send, receive})
export class InternalBankAccountApproval extends _RequestType<InternalBankAccountApprovalService, InternalBankAccountApproval> implements HasRequestType, IAuditModelProperties<InternalBankAccountApproval> {
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
  langService: LangService;

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
    this.langService = FactoryService.getService('LangService');
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    }
  }

  getAdminResultByProperty(property: keyof InternalBankAccountApproval): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'category':
        adminResultValue = this.bankCategoryInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      case 'operationType':
        adminResultValue = this.operationTypeInfo;
        if (this.operationType === BankAccountOperationTypes.ACCOUNT) {
          if (this.requestType === BankAccountRequestTypes.NEW) {
            adminResultValue = AdminResult.createInstance({
              arName: this.langService.getArabicLocalByKey('bank_operation_new_account'),
              enName: this.langService.getEnglishLocalByKey('bank_operation_new_account')
            });
          } else if (this.requestType === BankAccountRequestTypes.UPDATE) {
            adminResultValue = AdminResult.createInstance({
              arName: this.langService.getArabicLocalByKey('bank_operation_account'),
              enName: this.langService.getEnglishLocalByKey('bank_operation_account')
            });
          }
        }
        break;
      case 'bankId':
        adminResultValue = this.bankInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      oldLicenseFullSerial: {langKey: 'serial_number', value: this.oldLicenseFullSerial},
      operationType: {langKey: 'bank_operation_type', value: this.operationType},
      purpose: {langKey: 'bank_account_purpose', value: this.purpose},
      bankId: {langKey: 'bank_name', value: this.bankId},
      category: {langKey: 'account_type', value: this.category},
      currency: {langKey: 'currency', value: this.currency},
      mainAccount: {langKey: 'main_account', value: this.mainAccount},
      accountNumber: {langKey: 'account_number', value: this.accountNumber},
      iBan: {langKey: 'iban', value: this.iBan},
      swiftCode: {langKey: 'swift_code', value: this.swiftCode},
      selectedBankAccountToMerge: {langKey: 'bank_name', value: this.selectedBankAccountToMerge},
      ownerOfMergedBankAccounts: {langKey: 'merge_to_account', value: this.ownerOfMergedBankAccounts},
      selectedResponsiblePerson: {langKey: 'authorized_signatories', value: this.selectedResponsiblePerson},
    }
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      oldLicenseFullSerial, requestType, operationType, purpose, bankId, category,
      currency, mainAccount, accountNumber, iBan, swiftCode, selectedBankAccountToMerge,
      ownerOfMergedBankAccounts, selectedResponsiblePerson
    } = ObjectUtils.getControlValues<InternalBankAccountApproval>(this.getBasicInfoValuesWithLabels());
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
      swiftCode: controls ? [swiftCode, CustomValidators.commonValidations.swiftCode] : swiftCode,
      selectedBankAccountToMerge: controls ? [selectedBankAccountToMerge] : selectedBankAccountToMerge,
      ownerOfMergedBankAccounts: controls ? [ownerOfMergedBankAccounts] : ownerOfMergedBankAccounts,
      selectedResponsiblePerson: controls ? [selectedResponsiblePerson] : selectedResponsiblePerson
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = ObjectUtils.getControlValues<InternalBankAccountApproval>(this.getExplanationValuesWithLabels());
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
