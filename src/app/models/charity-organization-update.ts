import { FormControl } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { CharityOrganizationUpdateInterceptor } from '@app/model-interceptors/charity-organization-update-interceptor';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { FactoryService } from '@app/services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { CaseModel } from './case-model';
import { CharityBranch } from './charity-branch';
import { OrganizationOfficer } from './organization-officer';

const interceptor = new CharityOrganizationUpdateInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class CharityOrganizationUpdate extends CaseModel<
CharityOrganizationUpdateService,
CharityOrganizationUpdate
> {
  service: CharityOrganizationUpdateService = FactoryService.getService(
    'CharityOrganizationUpdateService'
  );
  caseType: number = CaseTypes.CHARITY_ORGANIZATION_UPDATE;


  arabicName!: string;
  englishName!: string;
  shortName!: string;
  logoId!: number;
  activityType!: number;
  activityTypeInfo!: AdminResult;
  createdOn!: string;
  regulatingLaw!: string;
  registrationAuthority!: number;
  publishDate!: string;
  registrationAuthorityInfo!: AdminResult;
  taxCardNo?: string;
  unifiedEconomicRecord?: string;

  phone!: string;
  email!: string;
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
  requestType = 0;

  complianceOfficerList!: OrganizationOfficer[];
  charityContactOfficerList!: OrganizationOfficer[];
  charityBranchList!: CharityBranch[];

  buildMetaDataForm(controls = true) {
    const {
      arabicName,
      englishName,
      shortName,
      logoId,
      activityType,
      createdOn,
      regulatingLaw,
      registrationAuthority,
      taxCardNo,
      unifiedEconomicRecord,
      publishDate,
    } = this;
    return {
      publishDate,
      arabicName: controls
        ? [
          arabicName,
          [
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),

            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ARABIC_NAME_MAX
            ),
            CustomValidators.pattern('AR_ONLY'),
          ],
        ]
        : arabicName,
      englishName: controls
        ? [
          englishName,
          [
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),

            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
            CustomValidators.pattern('ENG_ONLY'),
          ],
        ]
        : englishName,
      shortName: controls
        ? [shortName, [CustomValidators.required]]
        : shortName,
      logoId: controls ? [logoId, [CustomValidators.required]] : logoId,
      activityType: controls
        ? [activityType, [CustomValidators.required]]
        : activityType,
      createdOn,
      regulatingLaw: controls
        ? [regulatingLaw, [CustomValidators.required]]
        : regulatingLaw,
      registrationAuthority: controls
        ? [registrationAuthority, [CustomValidators.required]]
        : registrationAuthority,
      taxCardNo: controls ? [taxCardNo] : taxCardNo,
      unifiedEconomicRecord: controls ? [unifiedEconomicRecord] : unifiedEconomicRecord,
    };
  }
  buildContactInformationForm(controls = true) {
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
      youTube,
      snapChat,
    } = this;
    return {
      phone: controls ? [
        phone,
        [CustomValidators.required, ...CustomValidators.commonValidations.phone]
      ] : phone,
      email: controls ? [
        email,
        [CustomValidators.required, CustomValidators.pattern('EMAIL')]
      ] : email,
      website: controls ? [website, [CustomValidators.required]] : website,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required]] : zoneNumber,
      streetNumber: controls ? [streetNumber, [CustomValidators.required]] : streetNumber,
      buildingNumber: controls ? [buildingNumber, [CustomValidators.required]] : buildingNumber,
      address: controls ? [address, [CustomValidators.required]] : address,
      facebook: controls ? [facebook, [CustomValidators.required]] : facebook,
      twitter: controls ? [twitter, [CustomValidators.required]] : twitter,
      instagram: controls ? [instagram, [CustomValidators.required]] : instagram,
      youTube: controls ? [youTube, [CustomValidators.required]] : youTube,
      snapChat: controls ? [snapChat, [CustomValidators.required]] : snapChat,
    }
  }
}
