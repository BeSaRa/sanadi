import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ProfileServiceRelationInterceptor } from '@app/model-interceptors/profile-service-relation-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { ProfileServiceRelationService } from '@services/profile-service-relation.service';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';
import {searchFunctionType} from '@app/types/types';

const { receive, send } = new ProfileServiceRelationInterceptor();

@InterceptModel({
  receive,
  send,
})
export class ProfileServiceRelation extends BaseModel<ProfileServiceRelation, ProfileServiceRelationService> {

  serviceId!: number;
  serviceDataInfo!: AdminResult;
  profileInfo!: AdminResult;
  profileId!: number;

  searchFields: { [key: string]: searchFunctionType | string } = {
    serviceName: text => !this.serviceDataInfo ? false : this.serviceDataInfo.getName().toLowerCase().indexOf(text) !== -1
  };
  service: ProfileServiceRelationService;

  constructor() {
    super();
    this.service = FactoryService.getService('ProfileServiceRelationService');
  }
}
