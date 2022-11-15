import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { ProfileServiceRelation } from '@app/models/profile-service-relation';

export class ProfileServiceRelationInterceptor implements IModelInterceptor<ProfileServiceRelation> {
  caseInterceptor?: IModelInterceptor<ProfileServiceRelation> | undefined;
  send(model: Partial<ProfileServiceRelation>): Partial<ProfileServiceRelation> {
    ProfileServiceRelationInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: ProfileServiceRelation): ProfileServiceRelation {
    model.serviceDataInfo = AdminResult.createInstance(model.serviceDataInfo);
    model.profileInfo = AdminResult.createInstance(model.profileInfo);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ProfileServiceRelation>): void {
    delete model.searchFields;
    delete model.serviceDataInfo;
    delete model.profileInfo;
    delete model.service;
  }
}
