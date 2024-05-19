import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { FinancialTransferLicensingInterceptor } from '@app/model-interceptors/financial-transfer-licensing-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { FactoryService } from '@app/services/factory.service';
import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { EmployeeService } from '@services/employee.service';
import { FinancialTransfersProject } from './financial-transfers-project';
import { LicenseApprovalModel } from './license-approval-model';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMyDateModel } from 'angular-mydatepicker';

const { send, receive } = new FinancialTransferLicensingInterceptor();

@InterceptModel({ send, receive })
export class FinancialTransferLicensing extends LicenseApprovalModel<
  FinancialTransferLicensingService,
  FinancialTransferLicensing
> implements IAuditModelProperties<FinancialTransferLicensing> {
  caseType: number = CaseTypes.FINANCIAL_TRANSFERS_LICENSING;
  organizationId!: number;
  description!: string;
  // transfer operation
  transferType!: number;
  transferDescription!: string;
  subject!: string;
  transferCountry!: number;
  country!: number;
  qatariTransactionAmount!:number;
  //transferee bank account
  transfereeType!: number;
  transferringEntityName!: string;
  transferAccountNumber!: string;
  transfereeBankName!: string;
  transfereeIBAN!: string;

  // transfer bank account
  bankName!: string;
  transferFromIBAN!: string;
  accountNumber!: string;

  // affidavit of completion
  currency!: number;
  currencyTransferTransactionAmount!: number;
  actualTransferDate!: string| IMyDateModel;
  transferringEntityId!: string;
  transferNumber!: string;
  receiverType!: number;
  submissionMechanism!: number;

  financialTransfersProjects: FinancialTransfersProject[] = [];
  transferCountryInfo!: AdminResult;
  transfereeTypeInfo!: AdminResult;
  transferTypeInfo!: AdminResult;
  countryInfo!: AdminResult;
  currencyInfo!: AdminResult;
  licenseStatusInfo!:AdminResult

  service: FinancialTransferLicensingService;
  employeeService: EmployeeService;

  searchFields: ISearchFieldsMap<FinancialTransferLicensing> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields([
      'ouInfo',
      'requestTypeInfo',
      'caseStatusInfo',
      'creatorInfo',
    ]),
    ...normalSearchFields(['fullSerial', 'subject']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService(
      'FinancialTransferLicensingService'
    );
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
    this._setDefaultValues();
  }

  private _setDefaultValues(){
    this.organizationId = this.employeeService.getCurrentUser().getProfileId()!;
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getAdminResultByProperty(property: keyof FinancialTransferLicensing): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      case 'transferCountry':
        adminResultValue = this.transferCountryInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'transferType':
        adminResultValue = this.transferTypeInfo;
        break;
      case 'transfereeType':
        adminResultValue = this.transfereeTypeInfo;
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
      oldLicenseFullSerial:{langKey: 'serial_number', value: this.oldLicenseFullSerial},
    };
  }
  getBasicInfoFields(control = false): any {
    const {
      requestType,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
    } = this;

    return {
      requestType: control
        ? [requestType, [CustomValidators.required]]
        : requestType,
      oldLicenseFullSerial: control
        ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]]
        : oldLicenseFullSerial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
    };
  }
  getTransferOperationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      transferType:{langKey: 'transfer_type', value: this.transferType},
      subject:{langKey: 'subject', value: this.subject},
      transferDescription:{langKey: 'lbl_description', value: this.transferDescription},
      transferCountry:{langKey: 'transfer_to_country', value: this.transferCountry},
      country:{langKey: 'execution_country', value: this.country},
      qatariTransactionAmount:{langKey: 'transaction_amount_in_transfer_currency', value: this.qatariTransactionAmount},
    };
  }
  getTransferOperationFields(control = false): any {
    const {
      transferType,
      subject,
      transferDescription,
      transferCountry,
      country,
      qatariTransactionAmount,
    } = this;
    return {
      transferType: control
        ? [transferType, [CustomValidators.required]]
        : transferType,
      subject: control
        ? [
            subject,
            [
              CustomValidators.required,
              CustomValidators.pattern('HAS_LETTERS'),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : subject,
      transferDescription: control
        ? [
            transferDescription,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transferDescription,
      transferCountry: control
        ? [transferCountry, [CustomValidators.required]]
        : transferCountry,
      country: control ? [country, [CustomValidators.required]] : country,
      qatariTransactionAmount: control
        ? [
            qatariTransactionAmount,
            [
              CustomValidators.required,
              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              ),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              )
            ],
          ]
        : qatariTransactionAmount,
    };
  }
  getTransfereeBankAccountValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      transfereeType:{langKey: 'transferee_type', value: this.transfereeType},
      receiverType:{langKey: 'entity_type', value: this.receiverType},
      transferringEntityName:{langKey: 'entity_name', value: this.transferringEntityName},
      transferAccountNumber:{langKey: 'account_number', value: this.transferAccountNumber},
      transfereeBankName:{langKey: 'transferee_bank_name', value: this.transfereeBankName},
      transfereeIBAN:{langKey: 'transferee_iban', value: this.transfereeIBAN}, };
  }
  getTransfereeBankAccountFields(control = false): any {
    const {
      transfereeType,
      receiverType,
      transferringEntityName,
      transferAccountNumber,
      transfereeBankName,
      transfereeIBAN,
    } = this;
    return {
      transfereeType: control
        ? [transfereeType, [CustomValidators.required]]
        : transfereeType,
      receiverType: control
        ? [receiverType, []]
        : receiverType,
      transferringEntityName: control
        ? [
            transferringEntityName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transferringEntityName,
      transferAccountNumber: control
        ? [transferAccountNumber, [CustomValidators.required]]
        : transferAccountNumber,
      transfereeBankName: control
        ? [
            transfereeBankName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transfereeBankName,
      transfereeIBAN: control
        ? [
            transfereeIBAN,
            [
              CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH),
            ],
          ]
        : transfereeIBAN,
    };
  }
  getTransferBankAccountValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      bankName:{langKey: 'bank_name', value: this.bankName},
      transferFromIBAN:{langKey: 'transfer_from_iban', value: this.transferFromIBAN},
      accountNumber:{langKey: 'account_number', value: this.accountNumber},
    }
  }
  getTransferBankAccountFields(control = false): any {
    const { bankName, transferFromIBAN, accountNumber } = this;
    return {
      bankName: control
        ? [
            bankName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : bankName,
      transferFromIBAN: control
        ? [
            transferFromIBAN,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transferFromIBAN,
      accountNumber: control
        ? [
            accountNumber,
            [CustomValidators.required],
          ]
        : accountNumber,
    };
  }
  getAffidavitOfCompletionValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      currency:{langKey: 'currency', value: this.currency},
      currencyTransferTransactionAmount:{langKey: 'transaction_amount_in_transfer_currency', value: this.currencyTransferTransactionAmount},
      actualTransferDate:{langKey: 'lbl_transfer_operation_date', value: this.actualTransferDate},
      transferNumber:{langKey: 'transfer_number', value: this.transferNumber},  }
  }
  getAffidavitOfCompletionFields(control = false): any {
    const {
      currency,
      currencyTransferTransactionAmount,
      actualTransferDate,
      transferNumber,
    } = this;

    return {
      currency: control ? [currency, []] : currency,
      currencyTransferTransactionAmount: control
        ? [
            currencyTransferTransactionAmount,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              ),
              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              )

            ],
          ]
        : currencyTransferTransactionAmount,
      actualTransferDate: control
        ? [actualTransferDate, []]
        : actualTransferDate,
      transferNumber: control
        ? [
            transferNumber,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transferNumber,
    };
  }
  convertToFinancialTransferLicensing() {
    return new FinancialTransferLicensing().clone({
      caseType: CaseTypes.FINANCIAL_TRANSFERS_LICENSING,
      organizationId: this.organizationId,
      requestType: this.requestType,
      subject: this.subject,
      description: this.description,
      transferType: this.transferType,
      transferDescription: this.transferDescription,
      transferCountry: this.transferCountry,
      country: this.country,
      transferNumber: this.transferNumber,
      transfereeType: this.transfereeType,
      transferringEntityName: this.transferringEntityName,
      accountNumber: this.accountNumber,
      transfereeBankName: this.transfereeBankName,
      transfereeIBAN: this.transfereeIBAN,
      bankName: this.bankName,
      transferFromIBAN: this.transferFromIBAN,
      transferAccountNumber: this.transferAccountNumber,
      currency: this.currency,
      currencyTransferTransactionAmount: this.currencyTransferTransactionAmount,
      actualTransferDate: this.actualTransferDate,
      transferringEntityId: this.transferringEntityId,
    });
  }

  buildApprovalForm(control: boolean = false): any {
    const {
      followUpDate
    } = this;
    return {
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE)
  }
  returnToOrganization(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.taskDetails.tkiid, this.caseType, WFResponseType.RETURN_TO_ORG, false, this,'comment',true);
  }
  getSpecialExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    }
  }
}
