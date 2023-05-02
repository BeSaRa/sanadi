import { ControlValueLabelLangKey } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { TransferringIndividualFundsAbroadService } from '@services/transferring-individual-funds-abroad.service';
import { TransferringIndividualFundsAbroadInterceptor } from '@app/model-interceptors/transferring-individual-funds-abroad-interceptor';
import { InterceptModel } from '@decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { AdminResult } from '@app/models/admin-result';
import { TransferFundsExecutiveManagement } from '@app/models/transfer-funds-executive-management';
import { CustomValidators } from '@app/validators/custom-validators';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';
import { FactoryService } from '@services/factory.service';
import { IMyDateModel } from 'angular-mydatepicker';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { HasRequestType } from '@contracts/has-request-type';
import { ITransferIndividualFundsAbroadComplete } from '@contracts/i-transfer-individual-funds-abroad-complete';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@helpers/date-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { Payment } from '@app/models/payment';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { DateUtils } from '@app/helpers/date-utils';
import { ObjectUtils } from '@app/helpers/object-utils';

const _RequestType = mixinRequestType(CaseModel);
const interceptor = new TransferringIndividualFundsAbroadInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class TransferringIndividualFundsAbroad extends _RequestType<TransferringIndividualFundsAbroadService, TransferringIndividualFundsAbroad> implements HasRequestType, ITransferIndividualFundsAbroadComplete {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  service!: TransferringIndividualFundsAbroadService;
  caseType = CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD;
  licenseApprovedDate!: string;
  licenseDuration!: number;
  licenseStatus!: number;
  licenseStartDate!: string;
  licenseEndDate!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  licenseVSID!: string;
  customTerms!: string;
  publicTerms!: string;
  licenseStatusInfo!: AdminResult;
  address!: string;
  arName!: string;
  beneficiaryCountry!: number;
  city!: string;
  country!: number;
  chiefDecision!: number;
  chiefJustification!: string;
  conditionalLicenseIndicator!: boolean;
  currencyTransferTransactionAmount!: number;
  currency!: number;
  detailsAddress!: string;
  description!: string;
  domain!: number;
  email!: string;
  enName!: string;
  entityID!: number;
  entityType!: number;
  headQuarterType!: number;
  executionCountry!: number;
  executiveManagementList: TransferFundsExecutiveManagement[] = [];
  charityPurposeTransferList: TransferFundsCharityPurpose[] = [];
  payment: Payment[] = [];
  establishmentDate!: string | IMyDateModel;
  followUpDate!: string;
  identificationNumber!: string;
  jobTitle!: string;
  mainDACCategory!: number;
  mainUNOCHACategory!: number;
  managerDecision!: number;
  managerJustification!: string;
  mobileNo!: string;
  organizationArabicName!: string;
  organizationEnglishName!: string;
  organizationEmail!: string;
  nationality!: number;
  phone!: string;
  projectName!: string;
  projectType!: number;
  projectTotalCost!: number;
  projectImplementationPeriod!: number;
  postalCode!: string;
  receiverNameLikePassport!: string;
  receiverEnglishNameLikePassport!: string;
  receiverJobTitle!: string;
  receiverIdentificationNumber!: string;
  receiverPhone1!: string;
  receiverPhone2!: string;
  receiverPassportNumber!: string;
  receiverNationality!: number;
  region!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  firstSocialMedia!: string;
  secondSocialMedia!: string;
  thirdSocialMedia!: string;
  transferMethod!: number;
  transferType!: number;
  transferCountry!: number;
  transferringEntityName!: string;
  transferFromIBAN!: string;
  transfereeIBAN!: string;
  transfereeType!: number;
  subject!: string;
  qatariTransactionAmount!: number;
  website!: string;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  transfereeTypeInfo!: AdminResult;
  domainInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
  countryInfo!: AdminResult;
  transferCountryInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  ReceiverNationalityInfo!: AdminResult;
  headQuarterTypeInfo!: AdminResult;
  currencyInfo!: AdminResult;
  projectTypeInfo!: AdminResult;
  transferMethodInfo!: AdminResult;
  transferTypeInfo!: AdminResult;
  receiverNationalityInfo!: AdminResult;

  searchFields: ISearchFieldsMap<TransferringIndividualFundsAbroad> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'ouInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject', 'arName', 'enName'])
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
    this.service = FactoryService.getService('TransferringIndividualFundsAbroadService');
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      oldLicenseFullSerial: { langKey: 'serial_number', value: this.oldLicenseFullSerial },
      transfereeType: { langKey: 'transferee_type', value: this.transfereeType },
    };
  }
  buildBasicInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<TransferringIndividualFundsAbroad>(this.getBasicInfoValuesWithLabels())

    return {
      oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial] : values.oldLicenseFullSerial,
      requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
      transfereeType: controls ? [values.transfereeType, [CustomValidators.required]] : values.transfereeType
    };
  }

  getRequesterInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      arName: { langKey: 'arabic_name', value: this.arName },
      enName: { langKey: 'english_name', value: this.enName },
      nationality: { langKey: 'lbl_nationality', value: this.nationality },
      address: { langKey: 'lbl_address', value: this.address },
      phone: { langKey: 'lbl_phone', value: this.phone },
      mobileNo: { langKey: 'mobile_number', value: this.mobileNo },
      email: { langKey: 'lbl_email', value: this.email },
    };
  }
  buildRequesterInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<TransferringIndividualFundsAbroad>(this.getRequesterInfoValuesWithLabels())

    return {
      identificationNumber: controls ? [values.identificationNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : values.identificationNumber,
      arName: controls ? [values.arName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : values.arName,
      enName: controls ? [values.enName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : values.enName,
      nationality: controls ? [values.nationality, [CustomValidators.required]] : values.nationality,
      address: controls ? [values.address, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : values.address,
      phone: controls ? [values.phone, CustomValidators.commonValidations.phone] : values.phone,
      mobileNo: controls ? [values.mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : values.mobileNo,
      email: controls ? [values.email, [CustomValidators.required, ...CustomValidators.commonValidations.email]] : values.email
    };
  }

  getReceiverOrganizationInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      organizationArabicName: { langKey: 'organization_arabic_name', value: this.organizationArabicName },
      organizationEnglishName: { langKey: 'organization_english_name', value: this.organizationEnglishName },
      headQuarterType: { langKey: 'headquarter_type', value: this.headQuarterType },
      establishmentDate: { langKey: 'establishment_date', value: this.establishmentDate },
      country: { langKey: 'country', value: this.country },
      region: { langKey: 'region', value: this.region },
      city: { langKey: 'city', value: this.city },
      detailsAddress: { langKey: 'lbl_address', value: this.detailsAddress },
      postalCode: { langKey: 'postal_code', value: this.postalCode },
      website: { langKey: 'website', value: this.website },
      organizationEmail: { langKey: 'lbl_email', value: this.organizationEmail },
      firstSocialMedia: { langKey: 'social_media_1', value: this.firstSocialMedia },
      secondSocialMedia: { langKey: 'social_media_2', value: this.secondSocialMedia },
      thirdSocialMedia: { langKey: 'social_media_3', value: this.thirdSocialMedia },
    };
  }
  buildRequiredReceiverOrganizationInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<TransferringIndividualFundsAbroad>(this.getReceiverOrganizationInfoValuesWithLabels())

    return {
      organizationArabicName: controls ? [values.organizationArabicName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : values.organizationArabicName,
      organizationEnglishName: controls ? [values.organizationEnglishName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : values.organizationEnglishName,
      headQuarterType: controls ? [values.headQuarterType, [CustomValidators.required]] : values.headQuarterType,
      establishmentDate: controls ? [values.establishmentDate, [CustomValidators.required]] : values.establishmentDate,
      country: controls ? [values.country, [CustomValidators.required]] : values.country,
      region: controls ? [values.region, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.region,
      city: controls ? [values.city, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.city,
      detailsAddress: controls ? [values.detailsAddress, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.detailsAddress,
      postalCode: controls ? [values.postalCode, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : values.postalCode,
      website: controls ? [values.website, [CustomValidators.required, CustomValidators.pattern('WEBSITE')]] : values.website,
      organizationEmail: controls ? [values.organizationEmail, [CustomValidators.required, ...CustomValidators.commonValidations.email]] : values.organizationEmail,
      firstSocialMedia: controls ? [values.firstSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : values.firstSocialMedia,
      secondSocialMedia: controls ? [values.secondSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : values.secondSocialMedia,
      thirdSocialMedia: controls ? [values.thirdSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : values.thirdSocialMedia,
    };
  }

  getReceiverPersonInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      receiverNameLikePassport: { langKey: 'name_in_local_language_like_passport', value: this.receiverNameLikePassport },
      receiverEnglishNameLikePassport: { langKey: 'name_in_English_language_like_passport', value: this.receiverEnglishNameLikePassport },
      receiverJobTitle: { langKey: 'job_title', value: this.receiverJobTitle },
      receiverNationality: { langKey: 'lbl_nationality', value: this.receiverNationality },
      receiverIdentificationNumber: { langKey: 'national_id_number', value: this.receiverIdentificationNumber },
      receiverPassportNumber: { langKey: 'passport_number', value: this.receiverPassportNumber },
      receiverPhone1: { langKey: 'lbl_phone_1', value: this.receiverPhone1 },
      receiverPhone2: { langKey: 'lbl_phone_2', value: this.receiverPhone2 },
    };
  }
  buildRequiredReceiverPersonInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<TransferringIndividualFundsAbroad>(this.getReceiverPersonInfoValuesWithLabels())

    return {
      receiverNameLikePassport: controls ? [values.receiverNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.receiverNameLikePassport,
      receiverEnglishNameLikePassport: controls ? [values.receiverEnglishNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : values.receiverEnglishNameLikePassport,
      receiverJobTitle: controls ? [values.receiverJobTitle, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.receiverJobTitle,
      receiverNationality: controls ? [values.receiverNationality, [CustomValidators.required]] : values.receiverNationality,
      receiverIdentificationNumber: controls ? [values.receiverIdentificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.receiverIdentificationNumber,
      receiverPassportNumber: controls ? [values.receiverPassportNumber, [CustomValidators.required, ...CustomValidators.commonValidations.passport]] : values.receiverPassportNumber,
      receiverPhone1: controls ? [values.receiverPhone1, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.receiverPhone1,
      receiverPhone2: controls ? [values.receiverPhone2, CustomValidators.commonValidations.phone] : values.receiverPhone2,
    };
  }

  getFinancialTransactionInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      qatariTransactionAmount: { langKey: 'qatari_riyal_transaction_amount', value: this.qatariTransactionAmount },
      currencyTransferTransactionAmount: { langKey: 'transaction_amount_in_transfer_currency', value: this.currencyTransferTransactionAmount },
      currency: { langKey: 'currency', value: this.currency },
      transferMethod: { langKey: 'transfer_method', value: this.transferMethod },
      transferringEntityName: { langKey: 'transferring_entity_name', value: this.transferringEntityName },
      transferType: { langKey: 'transfer_type', value: this.transferType },
      transferFromIBAN: { langKey: 'transfer_from_iban', value: this.transferFromIBAN },
      transfereeIBAN: { langKey: 'transferee_iban', value: this.transfereeIBAN },
      transferCountry: { langKey: 'transfer_to_country', value: this.transferCountry },
    };
  }
  buildFinancialTransactionInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<TransferringIndividualFundsAbroad>(this.getFinancialTransactionInfoValuesWithLabels())

    return {
      qatariTransactionAmount: controls ? [values.qatariTransactionAmount, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(20)]] : values.qatariTransactionAmount,
      currencyTransferTransactionAmount: controls ? [values.currencyTransferTransactionAmount, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(20)]] : values.currencyTransferTransactionAmount,
      currency: controls ? [values.currency, [CustomValidators.required]] : values.currency,
      transferMethod: controls ? [values.transferMethod, [CustomValidators.required]] : values.transferMethod,
      transferringEntityName: controls ? [values.transferringEntityName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.transferringEntityName,
      transferType: controls ? [values.transferType, [CustomValidators.required]] : values.transferType,
      transferFromIBAN: controls ? [values.transferFromIBAN, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.transferFromIBAN,
      transfereeIBAN: controls ? [values.transfereeIBAN, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.transfereeIBAN,
      transferCountry: controls ? [values.transferCountry, [CustomValidators.required]] : values.transferCountry
    };
  }

  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : description,
    };
  }

  buildApprovalForm(controls: boolean = false): any {
    const {
      followUpDate,
      licenseEndDate,
      publicTerms,
      customTerms
    } = this;
    return {
      followUpDate: controls ? [followUpDate, [CustomValidators.required]] : followUpDate,
      licenseEndDate: controls ? [licenseEndDate, [CustomValidators.required]] : licenseEndDate,
      publicTerms: controls ? [{ value: publicTerms, disabled: true }] : publicTerms,
      customTerms: controls ? [customTerms] : customTerms
    }
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.finalApproveTask(this, WFResponseType.FINAL_APPROVE);
  }

  completeWithForm(form: UntypedFormGroup, selectedExecutives: TransferFundsExecutiveManagement[], selectedPurposes: TransferFundsCharityPurpose[]): DialogRef {
    return this.service!.completeTask(this, WFResponseType.COMPLETE, form, selectedExecutives, selectedPurposes);
  }
  getAdminResultByProperty(property: keyof TransferringIndividualFundsAbroad): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'managerDecision':
        adminResultValue = this.managerDecisionInfo;
        break;
      case 'reviewerDepartmentDecision':
        adminResultValue = this.reviewerDepartmentDecisionInfo;
        break;
      case 'specialistDecision':
        adminResultValue = this.specialistDecisionInfo;
        break;
      case 'chiefDecision':
        adminResultValue = this.chiefDecisionInfo;
        break;
      case 'chiefDecision':
        adminResultValue = this.chiefDecisionInfo;
        break;
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'transfereeType':
        adminResultValue = this.transfereeTypeInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'transferCountry':
        adminResultValue = this.transferCountryInfo;
        break;
      case 'nationality':
        adminResultValue = this.nationalityInfo;
        break;
      case 'headQuarterType':
        adminResultValue = this.headQuarterTypeInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      case 'projectType':
        adminResultValue = this.projectTypeInfo;
        break;
      case 'transferMethod':
        adminResultValue = this.transferMethodInfo;
        break;
      case 'transferType':
        adminResultValue = this.transferTypeInfo;
        break;
      case 'receiverNationality':
        adminResultValue = this.receiverNationalityInfo;
        break;
      case 'establishmentDate':
        const establishmentDate = DateUtils.getDateStringFromDate(this.establishmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: establishmentDate, enName: establishmentDate });
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
