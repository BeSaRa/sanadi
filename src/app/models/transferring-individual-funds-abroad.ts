import {CaseModel} from '@app/models/case-model';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {TransferringIndividualFundsAbroadInterceptor} from '@app/model-interceptors/transferring-individual-funds-abroad-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CaseTypes} from '@app/enums/case-types.enum';
import {AdminResult} from '@app/models/admin-result';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormGroup, Validators} from '@angular/forms';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {FactoryService} from '@services/factory.service';
import {IMyDateModel} from 'angular-mydatepicker';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {HasRequestType} from '@contracts/has-request-type';
import {ITransferIndividualFundsAbroadComplete} from '@contracts/i-transfer-individual-funds-abroad-complete';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@helpers/date-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {Payment} from '@app/models/payment';

const _RequestType = mixinRequestType(CaseModel);
const interceptor = new TransferringIndividualFundsAbroadInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class TransferringIndividualFundsAbroad extends _RequestType<TransferringIndividualFundsAbroadService, TransferringIndividualFundsAbroad> implements HasRequestType, ITransferIndividualFundsAbroadComplete{
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

  buildBasicInfo(controls: boolean = false): any {
    const {oldLicenseFullSerial, requestType, transfereeType} = this;
    return {
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      transfereeType: controls ? [transfereeType, [CustomValidators.required]] : transfereeType
    };
  }

  buildRequesterInfo(controls: boolean = false): any {
    const {identificationNumber, arName, enName, nationality, address, phone, mobileNo, email} = this;
    return {
      identificationNumber: controls ? [identificationNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : identificationNumber,
      arName: controls ? [arName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : enName,
      nationality: controls ? [nationality, [CustomValidators.required]] : nationality,
      address: controls ? [address, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : address,
      phone: controls ? [phone, CustomValidators.commonValidations.phone] : phone,
      mobileNo: controls ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      email: controls ? [email, [CustomValidators.required, Validators.email, CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]] : email
    };
  }

  buildRequiredReceiverOrganizationInfo(controls: boolean = false): any {
    const {
      organizationArabicName, organizationEnglishName, headQuarterType, establishmentDate, country, region, city,
      detailsAddress, postalCode, website, organizationEmail, firstSocialMedia, secondSocialMedia, thirdSocialMedia
    } = this;
    return {
      organizationArabicName: controls ? [organizationArabicName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : organizationArabicName,
      organizationEnglishName: controls ? [organizationEnglishName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : organizationEnglishName,
      headQuarterType: controls ? [headQuarterType, [CustomValidators.required ]] : headQuarterType,
      establishmentDate: controls ? [establishmentDate, [CustomValidators.required ]] : establishmentDate,
      country: controls ? [country, [CustomValidators.required ]] : country,
      region: controls ? [region, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : region,
      city: controls ? [city, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : city,
      detailsAddress: controls ? [detailsAddress, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : detailsAddress,
      postalCode: controls ? [postalCode, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : postalCode,
      website: controls ? [website, [CustomValidators.required, CustomValidators.pattern('WEBSITE')]] : website,
      organizationEmail: controls ? [organizationEmail, [CustomValidators.required, Validators.email, CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)]] : organizationEmail,
      firstSocialMedia: controls ? [firstSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : firstSocialMedia,
      secondSocialMedia: controls ? [secondSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : secondSocialMedia,
      thirdSocialMedia: controls ? [thirdSocialMedia, [CustomValidators.required, CustomValidators.maxLength(350)]] : thirdSocialMedia,
    };
  }

  buildRequiredReceiverPersonInfo(controls: boolean = false): any {
    const {
      receiverNameLikePassport, receiverEnglishNameLikePassport, receiverJobTitle, receiverNationality,
      receiverIdentificationNumber, receiverPassportNumber, receiverPhone1, receiverPhone2
    } = this;
    return {
      receiverNameLikePassport: controls ? [receiverNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : receiverNameLikePassport,
      receiverEnglishNameLikePassport: controls ? [receiverEnglishNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : receiverEnglishNameLikePassport,
      receiverJobTitle: controls ? [receiverJobTitle, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : receiverJobTitle,
      receiverNationality: controls ? [receiverNationality, [CustomValidators.required]] : receiverNationality,
      receiverIdentificationNumber: controls ? [receiverIdentificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : receiverIdentificationNumber,
      receiverPassportNumber: controls ? [receiverPassportNumber, [CustomValidators.required, ...CustomValidators.commonValidations.passport]] : receiverPassportNumber,
      receiverPhone1: controls ? [receiverPhone1, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : receiverPhone1,
      receiverPhone2: controls ? [receiverPhone2, CustomValidators.commonValidations.phone] : receiverPhone2,
    };
  }

  buildFinancialTransactionInfo(controls: boolean = false): any {
    const {
      qatariTransactionAmount, currencyTransferTransactionAmount, currency, transferMethod,
      transferringEntityName, transferType, transferFromIBAN, transfereeIBAN, transferCountry
    } = this;
    return {
      qatariTransactionAmount: controls ? [qatariTransactionAmount, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(20)]] : qatariTransactionAmount,
      currencyTransferTransactionAmount: controls ? [currencyTransferTransactionAmount, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(20)]] : currencyTransferTransactionAmount,
      currency: controls ? [currency, [CustomValidators.required]] : currency,
      transferMethod: controls ? [transferMethod, [CustomValidators.required]] : transferMethod,
      transferringEntityName: controls ? [transferringEntityName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : transferringEntityName,
      transferType: controls ? [transferType, [CustomValidators.required]] : transferType,
      transferFromIBAN: controls ? [transferFromIBAN, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : transferFromIBAN,
      transfereeIBAN: controls ? [transfereeIBAN, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : transfereeIBAN,
      transferCountry: controls ? [transferCountry, [CustomValidators.required]] : transferCountry
    };
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
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
      publicTerms: controls ? [{value: publicTerms, disabled: true}] : publicTerms,
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
}
