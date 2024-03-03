import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { FinancialTransfersProject } from '@app/models/financial-transfers-project';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { IMyDateModel } from 'angular-mydatepicker';
import { FinancialTransferProjectsInterceptor } from './financial-transfer-projects-interceptor';
const financialTransferProjectInterceptor = new FinancialTransferProjectsInterceptor()
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
   model.actualTransferDate && (model.actualTransferDate =  DateUtils.changeDateToDatepicker(model.actualTransferDate))
    model.transfereeTypeInfo &&
      (model.transfereeTypeInfo = AdminResult.createInstance(
        model.transfereeTypeInfo
      ));
    model.countryInfo &&
      (model.countryInfo = AdminResult.createInstance(model.countryInfo));
    model.financialTransfersProjects = model.financialTransfersProjects.map(x=>{
      return financialTransferProjectInterceptor.receive(new FinancialTransfersProject().clone(x))
    })

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
    model.financialTransfersProjects =( model.financialTransfersProjects??[]).map(x=>{
      return financialTransferProjectInterceptor.send(x) as FinancialTransfersProject
    })
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
