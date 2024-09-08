import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {BeneficiaryFamilyMember} from '@models/beneficiary-family-member';

export class BeneficiaryFamilyMemberInterceptor implements IModelInterceptor<BeneficiaryFamilyMember>{
  receive(model: BeneficiaryFamilyMember): BeneficiaryFamilyMember {
    return model;
  }

  send(model: Partial<BeneficiaryFamilyMember>): Partial<BeneficiaryFamilyMember> {
    BeneficiaryFamilyMemberInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BeneficiaryFamilyMember> | any): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.beneficiaryService;

  }
}
