import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';

export class GeneralAssociationExternalMemberInterceptor implements IModelInterceptor<GeneralAssociationExternalMember>{
    caseInterceptor?: IModelInterceptor<GeneralAssociationExternalMember> | undefined;
    send(model: Partial<GeneralAssociationExternalMember>): Partial<GeneralAssociationExternalMember> {
        return model;
    }
    receive(model: GeneralAssociationExternalMember): GeneralAssociationExternalMember {
        return model;
    }
}
