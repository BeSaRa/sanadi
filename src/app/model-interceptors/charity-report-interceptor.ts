import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CharityReport } from '@app/models/charity-report';

export class CharityReportInterceptor implements IModelInterceptor<CharityReport>{
  caseInterceptor?: IModelInterceptor<CharityReport> | undefined;
  send(model: Partial<CharityReport>): Partial<CharityReport> {
    delete model.categoryInfo;
    delete model.riskTypeInfo;
    delete model.reportStatusInfo;
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.auditOperation;
    delete model.generalDateStamp;
    return model;
  }
  receive(model: CharityReport): CharityReport {
    (model.categoryInfo && (model.categoryInfo = AdminResult.createInstance(model.categoryInfo)));
    (model.riskTypeInfo && (model.riskTypeInfo = AdminResult.createInstance(model.riskTypeInfo)));
    (model.reportStatusInfo && (model.reportStatusInfo = AdminResult.createInstance(model.reportStatusInfo)));
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate);
    model.generalDateStamp = !model.generalDate ? null : DateUtils.getTimeStampFromDate(model.generalDate);
    return model;
  }
}
