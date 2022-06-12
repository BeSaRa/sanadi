import { IMyDateModel } from 'angular-mydatepicker';
import { DateUtils } from '@app/helpers/date-utils';
import { JobApplication } from "./../models/job-application";
import { IModelInterceptor } from "@contracts/i-model-interceptor";

export class JobApplicationInterceptor
  implements IModelInterceptor<JobApplication>
{
  send(model: any) {
    model.employeeInfoDTOs.forEach((ei: any, i: number) => {
      if (ei.id < 0) {
        delete ei.id
      }
      model.employeeInfoDTOs[i] = {
        ...ei,
        contractExpiryDate: !ei.contractExpiryDate ? undefined : DateUtils.changeDateFromDatepicker(ei.contractExpiryDate as unknown as IMyDateModel)?.toISOString(),
        workStartDate: !ei.workStartDate ? undefined : DateUtils.changeDateFromDatepicker(ei.workStartDate as unknown as IMyDateModel)?.toISOString(),
        workEndDate: !ei.workEndDate ? undefined : DateUtils.changeDateFromDatepicker(ei.workEndDate as unknown as IMyDateModel)?.toISOString()
      };
    });
    return model;
  }

  receive(model: JobApplication): JobApplication {
    console.log(model)
    // contractExpiryDate: ei.contractExpiryDate ? DateUtils.getDateStringFromDate(ei.contractExpiryDate, 'DEFAULT_DATE_FORMAT') : '',
    // workStartDate: ei.workStartDate ? DateUtils.getDateStringFromDate(ei.workStartDate, 'DEFAULT_DATE_FORMAT') : '',
    // workEndDate: ei.workEndDate ? DateUtils.getDateStringFromDate(ei.workEndDate, 'DEFAULT_DATE_FORMAT') : '',
    return model;
  }
}
