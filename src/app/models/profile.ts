import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { INames } from '@app/interfaces/i-names';
import { ProfileInterceptor } from '@app/model-interceptors/profile-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ProfileService } from '@app/services/profile.service';
import { ISearchFieldsMap } from '@app/types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';
import { ProfileDetails } from './profile-details';

const { receive, send } = new ProfileInterceptor();

@InterceptModel({
  receive,
  send
})
export class Profile extends BaseModel<Profile, ProfileService> {
  service: ProfileService = FactoryService.getService('ProfileService');
  langService: LangService = FactoryService.getService('LangService');
  searchFields: ISearchFieldsMap<Profile> = {
    enName: 'enName',
    arName: 'arName',
    ...infoSearchFields(['statusInfo'])
  };
  arDesc!: string;
  enDesc!: string;
  profileCode!: string;
  registrationAuthority!: number;
  status!: number;
  statusInfo!: AdminResult;
  statusDateModified!: string | IMyDateModel;
  email!: string;
  profileDetails!: ProfileDetails;

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

}
