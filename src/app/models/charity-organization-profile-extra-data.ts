import {BaseModel} from '@app/models/base-model';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {FactoryService} from '@services/factory.service';
import {InterceptModel} from '@decorators/intercept-model';
import {CharityOrganizationProfileExtraDataInterceptor} from '@app/model-interceptors/charity-organization-profile-extra-data-interceptor';
import {Profile} from '@app/models/profile';
import {Officer} from '@app/models/officer';
import {Branch} from '@app/models/branch';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {IMyDateModel} from 'angular-mydatepicker';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {BlobModel} from '@app/models/blob-model';
import {AdminResult} from '@app/models/admin-result';

const {receive, send} = new CharityOrganizationProfileExtraDataInterceptor();

@InterceptModel({
  receive,
  send,
})
export class CharityOrganizationProfileExtraData extends BaseModel<CharityOrganizationProfileExtraData, CharityOrganizationProfileExtraDataService> {
  service: CharityOrganizationProfileExtraDataService = FactoryService.getService('CharityOrganizationProfileExtraDataService');
  profileId!: number;
  entityId!: number;
  profileInfo!: Profile;
  activityType!: number;
  shortName!: string;
  registrationDate!: string | IMyDateModel;
  establishmentDate!: string | IMyDateModel;
  publishDate!: string | IMyDateModel;
  unifiedEconomicRecord!: string;
  establishmentId!: string;
  taxCardNo!: string;
  regulatingLaw!: string;
  phone!: string;
  email!: string;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  status!: number;
  statusInfo!: AdminResult;
  activityTypeInfo!: AdminResult;
  website!: string;
  snapChat!: string;
  twitter!: string;
  facebook!: string;
  instagram!: string;
  youTube!: string;
  branchList: Branch[] = [];
  contactOfficerList: Officer[] = [];
  complianceOfficerList: Officer[] = [];
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildBasicInfoTab(controls?: boolean): any {
    const {
      arName, // view only
      enName, // view only
      activityType, // mandatory dropdown
      shortName, // mandatory
      establishmentDate, // view only
      publishDate, // view only
      registrationDate, // view only
      regulatingLaw, // mandatory
      unifiedEconomicRecord, // not mandatory
      taxCardNo, // not mandatory
      establishmentId
    } = this;
    return {
      arName: controls ? [{value: arName, disabled: true}, [
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [{value: enName, disabled: true}, [
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      activityType: controls ? [activityType, [CustomValidators.required]] : activityType,
      shortName: controls ? [shortName, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : shortName,
      establishmentDate: controls ? [{value: establishmentDate, disabled: true}] : establishmentDate,
      publishDate: controls ? [{value: publishDate, disabled: true}] : publishDate,
      registrationDate: controls ? [{value: registrationDate, disabled: true}] : registrationDate,
      regulatingLaw: controls ? [regulatingLaw, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : regulatingLaw,
      unifiedEconomicRecord: controls ? [unifiedEconomicRecord] : unifiedEconomicRecord,
      taxCardNo: controls ? [taxCardNo] : taxCardNo,
      establishmentId: controls ? [establishmentId, [CustomValidators.required]] : establishmentId,
    };
  }

  buildContactInfoTab(controls?: boolean): any {
    const {
      phone,
      email,
      website,
      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      facebook,
      twitter,
      instagram,
      snapChat,
      youTube
    } = this;
    return {
      phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      email: controls ? [email, [CustomValidators.required, CustomValidators.maxLength(200), Validators.email]] : email,
      website: controls ? [website, [CustomValidators.pattern('WEBSITE')]] : website,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(5)]] : zoneNumber,
      streetNumber: controls ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(5)]] : streetNumber,
      buildingNumber: controls ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(5)]] : buildingNumber,
      address: controls ? [address, [CustomValidators.required, CustomValidators.maxLength(512)]] : address,
      facebook: controls ? [facebook, [Validators.maxLength(350)]] : facebook,
      twitter: controls ? [twitter, [Validators.maxLength(350)]] : twitter,
      instagram: controls ? [instagram, [Validators.maxLength(350)]] : instagram,
      snapChat: controls ? [snapChat, [Validators.maxLength(350)]] : snapChat,
      youTube: controls ? [youTube, [Validators.maxLength(350)]] : youTube,
    };
  }

  saveLogo(file: File): Observable<boolean> {
    return this.service.updateLogo(this.id, file);
  }

  getLogo(): Observable<BlobModel> {
    return this.service.getLogo(this.id);
  }
}
