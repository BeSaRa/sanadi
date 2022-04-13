import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountLicense} from '@app/license-models/internal-bank-account-license';
import {AdminResult} from '@app/models/admin-result';

export class InternalBankAccountLicenseInterceptor implements IModelInterceptor<InternalBankAccountLicense> {
  send(model: Partial<InternalBankAccountLicense>): Partial<InternalBankAccountLicense> {
    return model;
  }

  receive(model: InternalBankAccountLicense): InternalBankAccountLicense {
    model.bankCategoryInfo && (model.bankCategoryInfo = AdminResult.createInstance(model.bankCategoryInfo));
    model.mainAccountInfo && (model.mainAccountInfo = AdminResult.createInstance(model.mainAccountInfo));
    model.currencyInfo && (model.currencyInfo = AdminResult.createInstance(model.currencyInfo));
    return model;
  }
}
