import { Profile } from '@app/models/profile';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { DialogRef } from './../shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { AdminResult } from './admin-result';
import { NpoBankAccount } from './npo-bank-account';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { FounderMembers } from '@app/models/founder-members';
import { RealBeneficiary } from './real-beneficiary';
import { DateUtils } from './../helpers/date-utils';
import { Validators } from '@angular/forms';
import { IMyDateModel } from 'angular-mydatepicker';
import { CustomValidators } from './../validators/custom-validators';
import { FactoryService } from './../services/factory.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { NpoManagementService } from './../services/npo-management.service';
import { HasRequestType } from './../interfaces/has-request-type';
import { HasLicenseDurationType } from './../interfaces/has-license-duration-type';
import { CaseModelContract } from './../contracts/case-model-contract';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { NpoManagementInterceptor } from '@app/model-interceptors/npo-management-interceptor';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new NpoManagementInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class NpoManagement
  extends _RequestType<NpoManagementService, NpoManagement>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<NpoManagementService, NpoManagement> {
  service!: NpoManagementService;
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  caseType: number = CaseTypes.NPO_MANAGEMENT;
  // basic data
  requestType!: number;
  arabicName!: string;
  englishName!: string;
  objectDBId!: number;
  unifiedEconomicRecord!: string;
  activityType!: number;
  establishmentDate!: string | IMyDateModel;
  registrationAuthority!: number;
  registrationDate!: string | IMyDateModel;
  registrationNumber!: string;
  disbandmentType!: number;
  disbandmentDate!: string | IMyDateModel;
  clearanceDate!: string | IMyDateModel;
  clearanceType!: number;
  clearanceName!: string;
  followUpDate!: string | IMyDateModel;
  // contact info
  phone!: string;
  email!: string;
  // national number
  fax!: string;
  hotline!: string;
  website!: string;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  facebook!: string;
  twitter!: string;
  instagram!: string;
  snapChat!: string;
  youTube!: string;
  profileId!: number;
  // readonly info
  contactOfficerList: NpoContactOfficer[] = [];
  founderMemberList: FounderMembers[] = [];
  bankAccountList: NpoBankAccount[] = [];
  realBeneficiaryList: RealBeneficiary[] = [];

  subject!: string;
  fullSerial!: string;
  oldLicenseFullSerial!: string;
  profileInfo!: Profile;
  activityTypeInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  clearanceInfo!: AdminResult;
  disbandmentInfo!: AdminResult;
  registrationAuthorityInfo!: AdminResult;

  searchFields: ISearchFieldsMap<NpoManagement> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  constructor() {
    super();
    this.service = FactoryService.getService("NpoManagementService");
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      arabicName: { langKey: 'lbl_arabic_name', value: this.arabicName },
      englishName: { langKey: 'lbl_english_name', value: this.englishName },
      clearanceName: { langKey: 'lbl_clearance_name', value: this.clearanceName },
      registrationNumber: { langKey: 'lbl_registration_number', value: this.registrationNumber },
      unifiedEconomicRecord: { langKey: 'unified_economic_record', value: this.unifiedEconomicRecord },
      registrationAuthority: { langKey: 'registration_authority', value: this.registrationAuthority },
      activityType: { langKey: 'activity_type', value: this.activityType },
      clearanceType: { langKey: 'lbl_clearance_type', value: this.clearanceType },
      disbandmentType: { langKey: 'lbl_disbandment_type', value: this.disbandmentType },
      establishmentDate: { langKey: 'establishment_date', value: this.establishmentDate },
      clearanceDate: { langKey: 'clearance_date', value: this.clearanceDate },
      registrationDate: { langKey: 'first_registration_date', value: this.registrationDate },
      oldLicenseFullSerial: { langKey: 'license_number', value: this.oldLicenseFullSerial },
    };
  }
  getContectInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      address: { langKey: 'lbl_address', value: this.address },
      phone: { langKey: 'lbl_phone', value: this.phone },
      fax: { langKey: 'fax_number', value: this.fax },
      website: { langKey: 'website', value: this.website },
      email: { langKey: 'lbl_email', value: this.email },
      zoneNumber: { langKey: 'lbl_zone', value: this.zoneNumber },
      buildingNumber: { langKey: 'building_number', value: this.buildingNumber },
      streetNumber: { langKey: 'lbl_street', value: this.streetNumber },
      facebook: { langKey: 'lbl_facebook', value: this.facebook },
      twitter: { langKey: 'lbl_twitter', value: this.twitter },
      instagram: { langKey: 'lbl_instagram', value: this.instagram },
      snapChat: { langKey: 'lbl_snapchat', value: this.snapChat },
      youTube: { langKey: 'lbl_youtube', value: this.youTube },
      hotline: { langKey: 'hotline', value: this.hotline },
    };
  }
  buildForm(controls?: boolean) {
    const values = ObjectUtils.getControlValues<NpoManagement>(this.getBasicInfoValuesWithLabels())

    return {
      basicInfo: {
        requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
        arabicName: controls ? [values.arabicName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : values.arabicName,
        englishName: controls ? [values.englishName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : values.englishName,
        unifiedEconomicRecord: controls ? [values.unifiedEconomicRecord, [Validators.required, Validators.maxLength(150)]] : values.unifiedEconomicRecord,
        activityType: controls ? [values.activityType, [Validators.required]] : values.activityType,
        registrationNumber: controls ? [values.registrationNumber, []] : values.registrationNumber,
        registrationAuthority: controls ? [values.registrationAuthority, []] : values.registrationAuthority,
        clearanceName: controls ? [values.clearanceName, []] : values.clearanceName,
        clearanceType: controls ? [values.clearanceType, []] : values.clearanceType,
        clearanceDate: controls ? [values.clearanceDate, []] : values.clearanceDate,
        disbandmentType: controls ? [values.disbandmentType, []] : values.disbandmentType,
        disbandmentDate: controls ? [values.disbandmentDate, []] : values.disbandmentDate,
        establishmentDate: controls ? [values.establishmentDate, []] : values.establishmentDate,
        registrationDate: controls ? [values.registrationDate, []] : values.registrationDate,
      },
      contectInfo: {
        email: controls ? [values.email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : values.email,
        phone: controls ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
        zoneNumber: controls ? [values.zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.zoneNumber,
        streetNumber: controls ? [values.streetNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.streetNumber,
        buildingNumber: controls ? [values.buildingNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : values.buildingNumber,
        fax: controls ? [values.fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : values.fax,
        address: controls ? [values.address, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.address,
        website: controls ? [values.website, [CustomValidators.required, CustomValidators.pattern('WEBSITE')]] : values.website,
        facebook: controls ? [values.facebook, [CustomValidators.maxLength(350)]] : values.facebook,
        twitter: controls ? [values.twitter, [CustomValidators.maxLength(350)]] : values.twitter,
        instagram: controls ? [values.instagram, [CustomValidators.maxLength(350)]] : values.instagram,
        snapChat: controls ? [values.snapChat, [CustomValidators.maxLength(350)]] : values.snapChat,
        youTube: controls ? [values.youTube, [CustomValidators.maxLength(350)]] : values.youTube,
        hotline: controls ? [values.hotline, [CustomValidators.number, Validators.maxLength(10)]] : values.hotline
      },
    };
  }
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof NpoManagement): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'activityType':
        adminResultValue = this.activityTypeInfo;
        break;
      case 'registrationAuthority':
        adminResultValue = this.registrationAuthorityInfo;
        break;
      case 'clearanceName':
        adminResultValue = this.clearanceInfo;
        break;
      case 'disbandmentType':
        adminResultValue = this.disbandmentInfo;
        break;
      case 'establishmentDate':
        const establishmentDate = DateUtils.getDateStringFromDate(this.establishmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: establishmentDate, enName: establishmentDate });
        break;
      case 'registrationDate':
        const registrationDate = DateUtils.getDateStringFromDate(this.registrationDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: registrationDate, enName: registrationDate });
        break;
      case 'disbandmentDate':
        const disbandmentDate = DateUtils.getDateStringFromDate(this.disbandmentDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: disbandmentDate, enName: disbandmentDate });
        break;
      case 'clearanceDate':
        const clearanceDate = DateUtils.getDateStringFromDate(this.clearanceDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: clearanceDate, enName: clearanceDate });
        break;
      case 'followUpDate':
        const followUpDate = DateUtils.getDateStringFromDate(this.followUpDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: followUpDate, enName: followUpDate });
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
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }
  validateApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.VALIDATE_APPROVE)
  }
}
