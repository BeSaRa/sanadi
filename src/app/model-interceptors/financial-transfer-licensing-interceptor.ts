import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { IMyDateModel } from 'angular-mydatepicker';

export class FinancialTransferLicensingInterceptor
  implements IModelInterceptor<FinancialTransferLicensing>
{
  receive(model: FinancialTransferLicensing): FinancialTransferLicensing {
     model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo));
    model.requestTypeInfo &&
      (model.requestTypeInfo = AdminResult.createInstance(
        model.requestTypeInfo
      ));
    model.transferCountryInfo &&
      (model.transferCountryInfo = AdminResult.createInstance(
        model.transferCountryInfo
      ));
    model.currencyInfo &&
      (model.currencyInfo = AdminResult.createInstance(model.currencyInfo));
    model.transferTypeInfo &&
      (model.transferTypeInfo = AdminResult.createInstance(
        model.transferTypeInfo
      ));
    model.transfereeTypeInfo &&
      (model.transfereeTypeInfo = AdminResult.createInstance(
        model.transfereeTypeInfo
      ));
    model.countryInfo &&
      (model.countryInfo = AdminResult.createInstance(model.countryInfo));
    model.currencyInfo &&
      (model.currencyInfo = AdminResult.createInstance(model.countryInfo));

    return model;
  }

  send(
    model: Partial<FinancialTransferLicensing>
  ): Partial<FinancialTransferLicensing> {
    model.followUpDate = !model.followUpDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.followUpDate as unknown as IMyDateModel
        )?.toISOString();
    model.actualTransferDate = !model.actualTransferDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.actualTransferDate as unknown as IMyDateModel
        )?.toISOString();
    FinancialTransferLicensingInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<FinancialTransferLicensing>
  ): void {
    delete model.countryInfo;
    delete model.requestTypeInfo;
    delete model.transferCountryInfo;
    delete model.licenseStatusInfo;
    delete model.currencyInfo;
    delete model.transferTypeInfo;
    delete model.transfereeTypeInfo;
    delete model.employeeService;
    delete model.service;
  }
}
