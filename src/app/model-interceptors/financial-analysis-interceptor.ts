import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { FinancialAnalysis } from '@app/models/financial-analysis';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';

export class FinancialAnalysisInterceptor
  implements IModelInterceptor<FinancialAnalysis>
{

  receive(model: FinancialAnalysis): FinancialAnalysis {
    //  model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.reportPeriodicityInfo && (model.reportPeriodicityInfo = AdminResult.createInstance(model.reportPeriodicityInfo));
    model.quarterTypeInfo && (model.quarterTypeInfo = AdminResult.createInstance(model.quarterTypeInfo));
    model.halfTypeInfo && (model.halfTypeInfo = AdminResult.createInstance(model.halfTypeInfo));
    model.externalOfficeIdInfo && (model.externalOfficeIdInfo = AdminResult.createInstance(model.externalOfficeIdInfo));
    return model;
  }

  send(
    model: Partial<FinancialAnalysis>
  ): Partial<FinancialAnalysis> {
    model.followUpDate = !model.followUpDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.followUpDate as unknown as IMyDateModel
      )?.toISOString();

    FinancialAnalysisInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<FinancialAnalysis>
  ): void {
    delete model.requestTypeInfo;
    delete model.employeeService;
    delete model.service;
    delete model.reportPeriodicityInfo
    delete model.quarterTypeInfo
    delete model.halfTypeInfo
    delete model.externalOfficeIdInfo
  }
}
