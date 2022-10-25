import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {AdminResult} from '@app/models/admin-result';

export class GeneralAssociationInternalMemberInterceptor implements IModelInterceptor<GeneralAssociationInternalMember> {
    caseInterceptor?: IModelInterceptor<GeneralAssociationInternalMember> | undefined;
    send(model: Partial<GeneralAssociationInternalMember>): Partial<GeneralAssociationInternalMember> {
      delete model.memberTypeInfo;
      delete model.langService;
      delete model.searchFields;
      delete model.name;
      delete model.pId;
      delete model.tkiid;
      return model;
    }
    receive(model: GeneralAssociationInternalMember): GeneralAssociationInternalMember {
      model.memberTypeInfo = model.memberTypeInfo ? AdminResult.createInstance(model.memberTypeInfo) : AdminResult.createInstance({});
      return model;
    }
}
