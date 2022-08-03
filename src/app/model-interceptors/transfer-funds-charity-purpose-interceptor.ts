import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {AdminResult} from '@app/models/admin-result';

export class TransferFundsCharityPurposeInterceptor implements IModelInterceptor<TransferFundsCharityPurpose> {
  send(model: Partial<TransferFundsCharityPurpose>): Partial<TransferFundsCharityPurpose> {
    delete model.searchFields;
    delete model.beneficiaryCountryInfo;
    delete model.domainInfo;
    delete model.executionCountryInfo;
    delete model.mainDACCategoryInfo;
    delete model.mainUNOCHACategoryInfo;
    delete model.projectTypeInfo;
    return model;
  }

  receive(model: TransferFundsCharityPurpose): TransferFundsCharityPurpose {
    model.beneficiaryCountryInfo = model.beneficiaryCountryInfo ? AdminResult.createInstance(model.beneficiaryCountryInfo) : AdminResult.createInstance({});
    model.domainInfo = model.domainInfo ? AdminResult.createInstance(model.domainInfo) : AdminResult.createInstance({});
    model.executionCountryInfo = model.executionCountryInfo ? AdminResult.createInstance(model.executionCountryInfo) : AdminResult.createInstance({});
    model.mainDACCategoryInfo = model.mainDACCategoryInfo ? AdminResult.createInstance(model.mainDACCategoryInfo) : AdminResult.createInstance({});
    model.mainUNOCHACategoryInfo = model.mainUNOCHACategoryInfo ? AdminResult.createInstance(model.mainUNOCHACategoryInfo) : AdminResult.createInstance({});
    model.projectTypeInfo = model.projectTypeInfo ? AdminResult.createInstance(model.projectTypeInfo) : AdminResult.createInstance({});
    return model;
  }
}
