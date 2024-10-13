import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { BeneficiaryFamilyMember } from '@models/beneficiary-family-member';
import { FactoryService } from '@services/factory.service';
import { LookupService } from '@services/lookup.service';
import { Lookup } from '@models/lookup';

export class BeneficiaryFamilyMemberInterceptor
  implements IModelInterceptor<BeneficiaryFamilyMember>
{
  receive(model: BeneficiaryFamilyMember): BeneficiaryFamilyMember {
    let lookupService =
      FactoryService.getService<LookupService>('LookupService');
    model.primaryIdTypeInfo =
      lookupService.listByCategory.BenIdType.find(
        (x) => x.lookupKey === model.primaryIdType
      ) || new Lookup();
    model.relativeTypeInfo =
      lookupService.listByCategory.BenRequestorRelationType.find(
        (x) => x.lookupKey === model.relativeType
      ) || new Lookup();

    return model;
  }

  send(
    model: Partial<BeneficiaryFamilyMember>
  ): Partial<BeneficiaryFamilyMember> {
    BeneficiaryFamilyMemberInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<BeneficiaryFamilyMember> | any
  ): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.beneficiaryService;
    delete model.primaryIdTypeInfo;
    delete model.relativeTypeInfo;
  }
}
