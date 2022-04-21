import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {BeneficiaryObligation} from '@app/models/beneficiary-obligation';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';

export class BeneficiaryObligationInterceptor implements IModelInterceptor<BeneficiaryObligation>{
  receive(model: BeneficiaryObligation): BeneficiaryObligation {
    let lookupService = FactoryService.getService<LookupService>('LookupService');
    model.installmentsCount = model.installmentsCount || 0;
    model.periodicTypeInfo = lookupService.listByCategory.SubAidPeriodicType.find(x=>x.lookupKey === model.periodicType) || new Lookup();
    model.benObligationTypeInfo = lookupService.listByCategory.BENEFICIARY_OBLIGATION.find(x=>x.lookupKey === model.benObligationType) || new Lookup();
    return model;
  }

  send(model: Partial<BeneficiaryObligation>): Partial<BeneficiaryObligation> {
    BeneficiaryObligationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BeneficiaryObligation> | any): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.beneficiaryService;
    delete model.periodicTypeInfo;
    delete model.benObligationTypeInfo;
  }
}
