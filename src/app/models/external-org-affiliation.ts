import { IMyDateModel } from 'angular-mydatepicker';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { Validators } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { ExecutiveManagement } from '@app/models/executive-management';
import { ContactOfficer } from '@app/models/contact-officer';
import { BankAccount } from '@app/models/bank-account';
import { FactoryService } from '@services/factory.service';
import { ExternalOrgAffiliationInterceptor } from './../model-interceptors/external-org-affiliation-interceptor';
import { CaseTypes } from './../enums/case-types.enum';
import { ExternalOrgAffiliationService } from '@services/external-org-affiliation.service';
import { HasRequestType } from '@contracts/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { InterceptModel } from '@decorators/intercept-model';
import { AdminResult } from './admin-result';
import { DialogRef } from '@app/shared/models/dialog-ref';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const { send, receive } = new ExternalOrgAffiliationInterceptor();

@InterceptModel({ send, receive })
export class ExternalOrgAffiliation extends _RequestType<ExternalOrgAffiliationService, ExternalOrgAffiliation> implements HasRequestType {
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
  introduction!: string;
  bankAccountDTOs: BankAccount[] = [];
  executiveManagementDTOs: ExecutiveManagement[] = [];
  contactOfficerDTOs: ContactOfficer[] = [];
  countryInfo!: AdminResult;
  customTerms!: string;
  publicTerms!: string;
  conditionalLicenseIndicator!: boolean;
  followUpDate!: string | IMyDateModel;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  constructor() {
    super();
    this.service = FactoryService.getService('ExternalOrgAffiliationService');
  }


  getFormFields(control: boolean = false): any {
    const {
      requestType,
      category,
      arName,
      enName,
      country,
      city,
      phone,
      fax,
      website,
      email,
      mailBox,
      introduction,
      oldLicenseFullSerial
    } = this;

    return {
      oldLicenseFullSerial: control ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      country: control ? [country, [CustomValidators.required]] : country,
      category: control ? [category, [CustomValidators.required]] : category,
      arName: control ? [arName, [CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
      Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arName,
      enName: control ? [enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : enName,
      city: control ? [city, [CustomValidators.required, CustomValidators.maxLength(100)]] : city,
      website: control ? [website, [CustomValidators.required, Validators.maxLength(350)]] : website,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      mailBox: control ? [mailBox, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : mailBox,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
      introduction: control ? [introduction, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : introduction,
    }
  }
  buildExplanation(control: boolean = false): any {
    const {
      description,
    } = this;
    return {
      description: control ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description
    }
  }
  buildApprovalForm(control: boolean = false): any {
    const {
      customTerms,
      publicTerms,
      conditionalLicenseIndicator,
      followUpDate
    } = this;
    return {
      customTerms: control ? [customTerms, [CustomValidators.required]] : customTerms,
      publicTerms: control ? [publicTerms, [CustomValidators.required]] : publicTerms,
      conditionalLicenseIndicator: control ? [conditionalLicenseIndicator, [CustomValidators.required]] : conditionalLicenseIndicator,
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }
}
