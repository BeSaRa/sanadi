import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {AdminResult} from '@app/models/admin-result';

export class GeneralAssociationExternalMemberInterceptor implements IModelInterceptor<GeneralAssociationExternalMember> {
  caseInterceptor?: IModelInterceptor<GeneralAssociationExternalMember> | undefined;

  send(model: Partial<GeneralAssociationExternalMember>): Partial<GeneralAssociationExternalMember> {
    delete model.jobTitleInfo;
    delete model.langService;
    delete model.searchFields;
    delete model.searchFieldsGeneralAssociation;
    return model;
  }

  receive(model: GeneralAssociationExternalMember): GeneralAssociationExternalMember {
    model.jobTitleInfo = model.jobTitleInfo ? AdminResult.createInstance(model.jobTitleInfo) : AdminResult.createInstance({});
    return model;
  }
}
