import { LinkedProjectTypes } from "@app/enums/linked-project-type.enum";
import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ActualInspection } from "@app/models/actual-inspection";
import { AdminResult } from "@app/models/admin-result";
import { InspectionActionLog } from "@app/models/inspection-action-log";
import { InternalUser } from "@app/models/internal-user";
import { LicenseActivity } from "@app/models/license-activity";
import { ProposedInspection } from "@app/models/proposed-inspection";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { InspectionActionLogInterceptor } from "./inspection-action-log-interceptor";
import { InternalUserInterceptor } from "./internal-user-interceptor";
import { LicenseActivityInterceptor } from "./license-activity-interceptor";
import { ProposedInspectionInterceptor } from "./proposed_inspection-interceptor";

export class ActualInspectionInterceptor implements IModelInterceptor<ActualInspection>
{
  send(model: Partial<ActualInspection>): Partial<ActualInspection> {
    const licenseActivityInterceptor = new LicenseActivityInterceptor();
    const internalUserInterceptor = new InternalUserInterceptor();
    const proposedInspectionInterceptor = new ProposedInspectionInterceptor();
    const inspectionActionLogInterceptor = new InspectionActionLogInterceptor();

    model.moneyLaundryOrTerrorism = model.moneyLaundryOrTerrorism === LinkedProjectTypes.YES ? true : false;
    model.licenseActivities = model.licenseActivities?.map(item => licenseActivityInterceptor.send(item) as LicenseActivity);
    model.dateFrom && (model.dateFrom = DateUtils.changeDateFromDatepicker(model.dateFrom as unknown as IMyDateModel)?.toISOString());
    model.dateTo && (model.dateTo = DateUtils.changeDateFromDatepicker(model.dateTo as unknown as IMyDateModel)?.toISOString());
    model.inspectionSpecialists = model.inspectionSpecialists?.map(item => {
      if (!!item.internalSpecialist) {
        item.internalSpecialist = internalUserInterceptor.send(item.internalSpecialist) as InternalUser
      }
      return item
    })
    model.proposedInspectionTask && (model.proposedInspectionTask = proposedInspectionInterceptor.send(model.proposedInspectionTask) as ProposedInspection)
    model.inspectionLogs && (model.inspectionLogs = model.inspectionLogs.map(item => inspectionActionLogInterceptor.send(item) as InspectionActionLog) )
    ActualInspectionInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: ActualInspection): ActualInspection {

    const inspectionActionLogInterceptor = new InspectionActionLogInterceptor();
    const proposedInspectionInterceptor = new ProposedInspectionInterceptor();
    model.moneyLaundryOrTerrorism = model.moneyLaundryOrTerrorism ? LinkedProjectTypes.YES : LinkedProjectTypes.NO;
    model.mainOperationInfo = AdminResult.createInstance(model.mainOperationInfo);
    model.subOperationInfo = AdminResult.createInstance(model.subOperationInfo);
    model.inspectorInfo = AdminResult.createInstance(model.inspectorInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.inspectionLogs && (model.inspectionLogs = model.inspectionLogs.map(item => inspectionActionLogInterceptor.receive(item)))
    model.proposedInspectionTask && (model.proposedInspectionTask = proposedInspectionInterceptor.receive(model.proposedInspectionTask))
    model.dateFrom = DateUtils.changeDateToDatepicker(model.dateFrom);
    model.dateTo = DateUtils.changeDateToDatepicker(model.dateTo);
    return model
  }
  private static _deleteBeforeSend(model: Partial<ActualInspection>): void {
    delete model.employeeService;
    delete model.searchFields;
    delete model.service;
    delete model.arName;
    delete model.enName;
    delete model.mainOperationInfo
    delete model.subOperationInfo
    delete model.inspectorInfo
    delete model.statusInfo

  }
}
