import { ResearchAndStudies } from './../models/research-and-studies';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { IMyDateModel } from 'angular-mydatepicker';

export class ResearchAndStudiesInterceptor
  implements IModelInterceptor<ResearchAndStudies>
{
  caseInterceptor?: IModelInterceptor<ResearchAndStudies> | undefined;
  send(model: Partial<ResearchAndStudies>): Partial<ResearchAndStudies> {
    delete model.langService;
    delete model.searchFields;
    delete model.employeeService;
    model.searchStartDate &&
      (model.searchStartDate = DateUtils.changeDateFromDatepicker(
        model.searchStartDate as unknown as IMyDateModel
      )?.toISOString());
    model.searchSubmissionDeadline &&
      (model.searchSubmissionDeadline = DateUtils.changeDateFromDatepicker(
        model.searchSubmissionDeadline as unknown as IMyDateModel
      )?.toISOString());

    return model;
  }
  receive(model: ResearchAndStudies): ResearchAndStudies {
    model.searchStartDate = DateUtils.changeDateToDatepicker(
      model.searchStartDate
    );
    model.searchSubmissionDeadline = DateUtils.changeDateToDatepicker(
      model.searchSubmissionDeadline
    );
    model.searchStartDateStamp = !model.searchStartDate ? null : DateUtils.getTimeStampFromDate(model.searchStartDate);
    model.searchSubmissionDeadlineStamp = !model.searchSubmissionDeadline ? null : DateUtils.getTimeStampFromDate(model.searchSubmissionDeadline);

    return model;
  }
}
