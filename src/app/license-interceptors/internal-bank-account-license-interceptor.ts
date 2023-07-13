import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountLicense} from '@app/license-models/internal-bank-account-license';
import {AdminResult} from '@app/models/admin-result';
import {isValidAdminResult} from '@app/helpers/utils';
import {Lookup} from '@app/models/lookup';
import {BankAccountExecutiveManagement} from "@models/bank-account-executive-management";

export class InternalBankAccountLicenseInterceptor implements IModelInterceptor<InternalBankAccountLicense> {
  send(model: Partial<InternalBankAccountLicense>): Partial<InternalBankAccountLicense> {
    return model;
  }

  receive(model: InternalBankAccountLicense): InternalBankAccountLicense {
    model.bankCategoryInfo = isValidAdminResult(model.bankCategoryInfo) ? AdminResult.createInstance(model.bankCategoryInfo) : AdminResult.createInstance({});
    model.mainAccountInfo = isValidAdminResult(model.mainAccountInfo) ? AdminResult.createInstance(model.mainAccountInfo) : AdminResult.createInstance({});
    model.currencyInfo = isValidAdminResult(model.currencyInfo) ? AdminResult.createInstance(model.currencyInfo) : AdminResult.createInstance({});
    model.bankInfo = isValidAdminResult(model.bankInfo) ? AdminResult.createInstance(model.bankInfo) : AdminResult.createInstance({});
    model.licenseStatusInfo = (model.licenseStatusInfo) ? (new Lookup()).clone(model.licenseStatusInfo) : new Lookup();
    model.requestTypeInfo = (model.requestTypeInfo) ? (new Lookup()).clone(model.requestTypeInfo) : new Lookup();
    model.operationTypeInfo = (model.operationTypeInfo) ? AdminResult.createInstance(model.operationTypeInfo) : AdminResult.createInstance({});
    model.bankAccountExecutiveManagementDTOs ? model.bankAccountExecutiveManagementDTOs = model.bankAccountExecutiveManagementDTOs.map(x => {
      return new BankAccountExecutiveManagement().clone(x);
    }) : model.bankAccountExecutiveManagementDTOs = [];

    return model;
  }
}
