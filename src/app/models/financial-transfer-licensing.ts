import { FinancialTransfersProject } from './financial-transfers-project';
import { EmployeeService } from '@services/employee.service';
import { AdminResult } from '@app/models/admin-result';
import { CaseTypes } from '@app/enums/case-types.enum';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { FactoryService } from '@app/services/factory.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { LicenseApprovalModel } from './license-approval-model';
import { FinancialTransferLicensingInterceptor } from '@app/model-interceptors/financial-transfer-licensing-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { ImplementingAgencyTypes } from '@app/enums/implementing-agency-types.enum';

const { send, receive } = new FinancialTransferLicensingInterceptor();

@InterceptModel({ send, receive })
export class FinancialTransferLicensing extends LicenseApprovalModel<
  FinancialTransferLicensingService,
  FinancialTransferLicensing
> {
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
  actualTransferDate!: string;
  transferringEntityId!: string;
  transferNumber!: string;

  followUpDateString: string = '';
  receiverType!: number;

  financialTransfersProjects: FinancialTransfersProject[] = [];
  transferCountryInfo!: AdminResult;
  transfereeTypeInfo!: AdminResult;
  transferTypeInfo!: AdminResult;
  countryInfo!: AdminResult;
  currencyInfo!: AdminResult;

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

  getBasicInfoFields(control = false): any {
    const {
      requestType,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
      subject,
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
      // subject: control
      //   ? [
      //       subject,
      //       [
      //         CustomValidators.required,
      //         CustomValidators.maxLength(
      //           CustomValidators.defaultLengths.ENGLISH_NAME_MAX
      //         ),
      //       ],
      //     ]
      //   : subject,
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
            ],
          ]
        : qatariTransactionAmount,
    };
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
        ? [transferAccountNumber, [CustomValidators.required, CustomValidators.number]]
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
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transfereeIBAN,
    };
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
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : transferFromIBAN,
      accountNumber: control
        ? [
            accountNumber,
            [CustomValidators.required, CustomValidators.number],
          ]
        : accountNumber,
    };
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

              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              ),
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
}
