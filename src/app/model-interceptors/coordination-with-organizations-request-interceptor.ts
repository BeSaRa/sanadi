import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { CoordinationWithOrganizationsRequest } from "@app/models/coordination-with-organizations-request";
import { TaskDetails } from "@app/models/task-details";
import { IMyDateModel } from "angular-mydatepicker";

export class CoordinationWithOrganizationsRequestInterceptor
  implements IModelInterceptor<CoordinationWithOrganizationsRequest>
{
  send(
    model: Partial<CoordinationWithOrganizationsRequest>
  ): Partial<CoordinationWithOrganizationsRequest> {
    delete model.service;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.ouInfo;
    delete model.employeeService;
    model.licenseStartDate = !model.licenseStartDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.licenseStartDate as unknown as IMyDateModel
        )?.toISOString();

    model.licenseEndDate = !model.licenseEndDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.licenseEndDate as unknown as IMyDateModel
        )?.toISOString();
    model.participatingOrganizaionList?.forEach((x) => {
      delete (x as any).searchFields;
      delete (x as any).DisplayedColumns;
    });
    model.organizaionOfficerList?.forEach((x) => {
      delete x.langService;
      delete (x as any).searchFields;
    });
    model.researchAndStudies?.forEach((x) => {
      delete x.langService;
      delete (x as any).searchFields;
      x.searchStartDate =
         DateUtils.changeDateFromDatepicker(
            x.searchStartDate as unknown as IMyDateModel
          )?.toISOString()!;
      x.searchSubmissionDeadline = DateUtils.changeDateFromDatepicker(
            x.searchSubmissionDeadline as unknown as IMyDateModel
          )?.toISOString()!;
    });
    model.buildingAbilitiesList?.forEach((x) => {
      delete (x as any).searchFields;
      x.suggestedActivityDateFrom =  DateUtils.changeDateFromDatepicker(
            x.suggestedActivityDateFrom as unknown as IMyDateModel
          )?.toISOString()!;
      x.suggestedActivityDateTo = DateUtils.changeDateFromDatepicker(
            x.suggestedActivityDateTo as unknown as IMyDateModel
          )?.toISOString()!;
     
    });
    model.effectiveCoordinationCapabilities?.forEach((x) => {
      delete x.langService;
      delete (x as any).searchFields;
      delete (x as any).searchFields;
      x.eventStartDate = DateUtils.changeDateFromDatepicker(
            x.eventStartDate as unknown as IMyDateModel
          )?.toISOString()!;
    });

    
    model.researchAndStudies?.forEach((x) => {
      delete x.langService;
      delete (x as any).searchFields;
    });
    return model;
  }
  receive(
    model: CoordinationWithOrganizationsRequest
  ): CoordinationWithOrganizationsRequest {
    model.licenseStartDate = DateUtils.changeDateToDatepicker(model.licenseStartDate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    model.taskDetails = new TaskDetails().clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    
    
    return model;
  }
}
