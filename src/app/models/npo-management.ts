import { DateUtils } from './../helpers/date-utils';
import { Validators } from '@angular/forms';
import { BankAccount } from './bank-account';
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

  activityType!: number;
  registrationAuthority!: number;
  clearanceType!: number;
  disbandmentType!: number;
  registrationDate!: Date | IMyDateModel;
  establishmentDate!: Date | IMyDateModel;
  disbandmentDate!: Date | IMyDateModel;
  clearanceDate!: Date | IMyDateModel;

  clearanceName!: string;
  registrationNumber!: string;
  unifiedEconomicRecord!: string;
  // contact info
  phone!: string;
  email!: string;
  // national number
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  website!: string;
  facebook!: string;
  twitter!: string;
  instagram!: string;
  snapChat!: string;
  youTube!: string;
  fax!: string;
  hotline!: string;
  // readonly info
  contactOfficerList: [] = [];
  founderMemberList: [] = [];
  bankAccountList: BankAccount[] = [];
  realBeneficiaryList: [] = [];

  subject!: string;
  fullSerial!: string;
  oldLicenseFullSerial!: string;
  searchFields: ISearchFieldsMap<NpoManagement> = {
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
      //
      email, phone,
      //
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
        clearanceName: controls ? [clearanceName, [CustomValidators.required, Validators.maxLength(150),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : clearanceName,
        registrationNumber: controls ? [registrationNumber, [CustomValidators.required, Validators.maxLength(150),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : registrationNumber,
        unifiedEconomicRecord: controls ? [unifiedEconomicRecord, [Validators.maxLength(150)]] : unifiedEconomicRecord,
        activityType: controls
          ? [activityType, [Validators.required]]
          : activityType,
        registrationAuthority: controls
          ? [registrationAuthority, []]
          : registrationAuthority,
        clearanceType: controls
          ? [clearanceType, [Validators.required]]
          : clearanceType,
        disbandmentType: controls
          ? [disbandmentType, [Validators.required]]
          : disbandmentType,
        establishmentDate: controls ? [DateUtils.changeDateToDatepicker(establishmentDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(establishmentDate),
        disbandmentDate: controls ? [DateUtils.changeDateToDatepicker(disbandmentDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(disbandmentDate),
        clearanceDate: controls ? [DateUtils.changeDateToDatepicker(clearanceDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(clearanceDate),
      },
      contectInfo: {
        email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
        phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      },
      nationalAddress: {
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
}
