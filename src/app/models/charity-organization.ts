import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityOrganizationInterceptor } from '@app/model-interceptors/charity-organization-interceptor';
import { CharityOrganizationService } from '@app/services/charity-organization.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { BaseModel } from './base-model';
import { CharityBranch } from './charity-branch';
import { CharityOrganizationUpdate } from './charity-organization-update';
import { OrganizationOfficer } from './organization-officer';
import { Profile } from './profile';

const interceptor = new CharityOrganizationInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class CharityOrganization extends BaseModel<
  CharityOrganization,
  CharityOrganizationService
> {
  service: CharityOrganizationService = FactoryService.getService(
    'CharityOrganizationService'
  );
  langService: LangService = FactoryService.getService('LangService');
  id!: number;
  profileId!: number;
  profileInfo!: Profile;
  updatedBy!: number;
  clientData!: string;
  arName!: string;
  enName!: string;
  activityType!: number;
  registrationDate!: string;
  shortName!: string;
  establishmentDate!: string;
  publishDate!: string;
  unifiedEconomicRecord!: string;
  establishmentID!: string;
  taxCardNo!: string;
  regulatingLaw!: string;
  phone!: string;
  email!: string;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  ldapGroupName!: string;
  status!: number;
  statusDateModified!: string;
  website!: string;
  snapChat!: string;
  twitter!: string;
  facebook!: string;
  instagram!: string;
  youTube!: string;
  branchList: CharityBranch[] = [];
  contactOfficer: OrganizationOfficer[] = [];
  complianceOfficer: OrganizationOfficer[] = [];

  getName(): string {
    return this.langService.map.lang === 'en' ? this.enName : this.arName;
  }
  toCharityOrganizationUpdate() {
    const {
      id,
      arName,
      enName,
      activityType,
      profileInfo,
      registrationDate,
      shortName,
      establishmentDate,
      publishDate,
      unifiedEconomicRecord,
      establishmentID,
      taxCardNo,
      regulatingLaw,
      phone,
      email,
      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      website,
      snapChat,
      twitter,
      facebook,
      instagram,
      youTube,
      branchList,
      contactOfficer,
      complianceOfficer,
      profileId
    } = this;
    const model = new CharityOrganizationUpdate().clone({
      charityId: id,
      arabicName: arName,
      englishName: enName,
      activityType,
      registrationAuthority: profileId,
      registrationAuthorityInfo: profileInfo.registrationAuthorityInfo,
      shortName,
      establishmentDate,
      publishDate,
      unifiedEconomicRecord,
      establishmentID,
      taxCardNo,
      regulatingLaw,
      phone,
      email,
      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      website,
      snapChat,
      twitter,
      facebook,
      instagram,
      youTube,
      charityBranchList: branchList,
      charityContactOfficerList: contactOfficer,
      complianceOfficerList: complianceOfficer,
      registrationDate
    });
    return model;
  }
}
