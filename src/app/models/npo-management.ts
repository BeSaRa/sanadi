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
import { ISearchFieldsMap } from './../types/types';
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

  buildForm(controls?: boolean) {
    const {
      requestType,
      arabicName,
      englishName,
      clearanceName,
      registrationNumber,
      unifiedEconomicRecord,
      activityType,
      registrationAuthority,
      clearanceType,
      disbandmentType,
      establishmentDate,
      disbandmentDate,
      clearanceDate,
      registrationDate,
      //
      email, phone,
      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      website,
      facebook,
      twitter,
      instagram,
      snapChat,
      youTube,
      fax,
      hotline
    } = this;
    return {
      basicInfo: {
        requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
        arabicName: controls ? [arabicName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arabicName,
        englishName: controls ? [englishName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : englishName,
        unifiedEconomicRecord: controls ? [unifiedEconomicRecord, [Validators.required, Validators.maxLength(150)]] : unifiedEconomicRecord,
        activityType: controls ? [activityType, [Validators.required]] : activityType,
        registrationNumber: controls ? [registrationNumber, []] : registrationNumber,
        registrationAuthority: controls ? [registrationAuthority, []] : registrationAuthority,
        clearanceName: controls ? [clearanceName, []] : clearanceName,
        clearanceType: controls ? [clearanceType, []] : clearanceType,
        clearanceDate: controls ? [clearanceDate, []] : clearanceDate,
        disbandmentType: controls ? [disbandmentType, []] : disbandmentType,
        disbandmentDate: controls ? [disbandmentDate, []] : disbandmentDate,
        establishmentDate: controls ? [establishmentDate, []] : establishmentDate,
        registrationDate: controls ? [registrationDate, []] : registrationDate,
      },
      contectInfo: {
        email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
        phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
        zoneNumber: controls ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : zoneNumber,
        streetNumber: controls ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : streetNumber,
        buildingNumber: controls ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : buildingNumber,
        fax: controls ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
        address: controls ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
        website: controls ? [website, [CustomValidators.required, CustomValidators.maxLength(350)]] : website,
        facebook: controls ? [facebook, [CustomValidators.maxLength(350)]] : facebook,
        twitter: controls ? [twitter, [CustomValidators.maxLength(350)]] : twitter,
        instagram: controls ? [instagram, [CustomValidators.maxLength(350)]] : instagram,
        snapChat: controls ? [snapChat, [CustomValidators.maxLength(350)]] : snapChat,
        youTube: controls ? [youTube, [CustomValidators.maxLength(350)]] : youTube,
        hotline: controls ? [hotline, [CustomValidators.number, Validators.maxLength(10)]] : hotline
      },
    };
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
}
