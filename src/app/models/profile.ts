import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {INames} from '@app/interfaces/i-names';
import {ProfileInterceptor} from '@app/model-interceptors/profile-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {ProfileService} from '@app/services/profile.service';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {AdminResult} from './admin-result';
import {BaseModel} from './base-model';
import {ProfileDetails} from './profile-details';
import {Observable, of} from 'rxjs';
import {ProfileServiceRelation} from '@app/models/profile-service-relation';
import {ProfileServiceRelationService} from '@services/profile-service-relation.service';
import {DialogRef} from '@app/shared/models/dialog-ref';

const {receive, send} = new ProfileInterceptor();

@InterceptModel({
  receive,
  send,
})
export class Profile extends BaseModel<Profile, ProfileService> {
  service: ProfileService = FactoryService.getService('ProfileService');
  langService: LangService = FactoryService.getService('LangService');
  searchFields: ISearchFieldsMap<Profile> = {
    enName: 'enName',
    arName: 'arName',
    ...infoSearchFields(['profileTypeInfo', 'statusInfo']),
  };
  profileType!: number;
  arDesc!: string;
  enDesc!: string;
  profileCode!: string;
  registrationAuthority!: number;
  registrationAuthorityInfo!: AdminResult;
  profileTypeInfo!: AdminResult;
  status: number = CommonStatusEnum.ACTIVATED;
  statusInfo!: AdminResult;
  statusDateModified!: string | IMyDateModel;
  email!: string;
  profileDetails!: ProfileDetails;
  permitTypeList: number[] = [];
  submissionMechanism?: number

  permitTypes!: string

  // not related to the model
  permitTypesInfo: AdminResult[] = []

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls = true) {
    const {
      arName,
      enName,
      profileType,
      arDesc,
      enDesc,
      profileCode,
      registrationAuthority,
      email,
      permitTypeList,
      submissionMechanism
    } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      profileType: controls ? [profileType, [CustomValidators.required]] : profileType,
      arDesc: controls ? [arDesc, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
      ]] : arDesc,
      profileCode: controls ? [profileCode, [CustomValidators.required], []] : profileCode,
      registrationAuthority: controls ? [registrationAuthority] : registrationAuthority,
      email: controls ? [email, [CustomValidators.required,
        CustomValidators.pattern('EMAIL'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX),
      ]] : email,
      permitTypeList: controls ? [permitTypeList] : permitTypeList,
      submissionMechanism: controls ? [submissionMechanism] : submissionMechanism
    };
  }

  updateStatus(profileId: number, status: CommonStatusEnum) {
    if (status === CommonStatusEnum.ACTIVATED) {
      return this.service.deActivate(profileId);
    }
    return this.service.activate(profileId);
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }

  loadLinkedServices(): Observable<ProfileServiceRelation[]> {
    if (!this.id) {
      return of([]);
    }
    let profileServiceRelationService: ProfileServiceRelationService = FactoryService.getService('ProfileServiceRelationService');
    return profileServiceRelationService.getServicesByProfile(this.id);
  }

  getParsedPermitTypes(): number[] {
    let parsed: { ids: number[] };
    parsed = JSON.parse(this.permitTypes || '{"ids": []}')
    return parsed.hasOwnProperty('ids') ? parsed.ids : []
  }
}
