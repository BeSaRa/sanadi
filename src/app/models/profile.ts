import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { INames } from '@app/interfaces/i-names';
import { ProfileInterceptor } from '@app/model-interceptors/profile-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ProfileService } from '@app/services/profile.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';
import { ProfileDetails } from './profile-details';

const { receive, send } = new ProfileInterceptor();

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
    ...infoSearchFields(['statusInfo']),
  };
  profileType!: number;
  arDesc!: string;
  enDesc!: string;
  profileCode!: string;
  registrationAuthority!: number;
  registrationAuthorityInfo!: AdminResult;
  profileTypeInfo!: AdminResult;
  status!: number;
  statusInfo!: AdminResult;
  statusDateModified!: string | IMyDateModel;
  email!: string;
  profileDetails!: ProfileDetails;

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
      status,
      email,
    } = this;
    return {
      arName: controls
        ? [
          arName,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ARABIC_NAME_MAX
            ),
          ],
        ]
        : arName,
      enName: controls
        ? [
          enName,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : enName,
      profileType: controls
        ? [profileType, [CustomValidators.required]]
        : profileType,
      arDesc: controls
        ? [
          arDesc,
          [
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EXPLANATIONS
            ),
          ],
        ]
        : arDesc,
      profileCode: controls
        ? [profileCode, [CustomValidators.required]]
        : profileCode,
      registrationAuthority: controls
        ? [registrationAuthority]
        : registrationAuthority,
      status: controls ? [status] : status,
      email: controls
        ? [
          email,
          [
            CustomValidators.required,
            CustomValidators.pattern('EMAIL'),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EMAIL_MAX
            ),
          ],
        ]
        : email,
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
}
