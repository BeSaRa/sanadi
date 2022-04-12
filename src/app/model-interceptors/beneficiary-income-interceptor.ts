import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {BeneficiaryIncome} from '@app/models/beneficiary-income';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';

export class BeneficiaryIncomeInterceptor implements IModelInterceptor<BeneficiaryIncome>{
  receive(model: BeneficiaryIncome): BeneficiaryIncome {
    let lookupService = FactoryService.getService<LookupService>('LookupService');
    model.periodicTypeInfo = lookupService.listByCategory.BENEFICIARY_INCOME_PERODIC.find(x=>x.lookupKey === model.periodicType) || new Lookup();
    model.benIncomeTypeInfo = lookupService.listByCategory.BENEFICIARY_INCOME.find(x=>x.lookupKey === model.benIncomeType) || new Lookup();
    return model;
  }

  send(model: Partial<BeneficiaryIncome>): Partial<BeneficiaryIncome> {
    BeneficiaryIncomeInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BeneficiaryIncome> | any): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.beneficiaryService;
    delete model.periodicTypeInfo;
    delete model.benIncomeTypeInfo;

  }
}
