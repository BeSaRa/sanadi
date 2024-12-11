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

export class ActualInspectionInterceptor implements IModelInterceptor<ActualInspection> {
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
    model.inspectionLogs && (model.inspectionLogs = model.inspectionLogs.map(item => inspectionActionLogInterceptor.send(item) as InspectionActionLog))
    ActualInspectionInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: ActualInspection): ActualInspection {

    const inspectionActionLogInterceptor = new InspectionActionLogInterceptor();
    const proposedInspectionInterceptor = new ProposedInspectionInterceptor();
    const licenseActivityInterceptor = new LicenseActivityInterceptor();
    model.moneyLaundryOrTerrorism = model.moneyLaundryOrTerrorism ? LinkedProjectTypes.YES : LinkedProjectTypes.NO;
    model.mainOperationInfo = AdminResult.createInstance(model.mainOperationInfo);
    model.subOperationInfo = AdminResult.createInstance(model.subOperationInfo);
    model.inspectorInfo = AdminResult.createInstance(model.inspectorInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.departmentInfo = AdminResult.createInstance(model.departmentInfo);
    model.actualTaskInfo = AdminResult.createInstance(model.actualTaskInfo);
    model.priorityInfo = AdminResult.createInstance(model.priorityInfo);
    model.knownOrgInfo = AdminResult.createInstance(model.knownOrgInfo);
    model.unknownOrgTypeInfo = AdminResult.createInstance(model.unknownOrgTypeInfo);
    model.taskNatureInfo = AdminResult.createInstance(model.taskNatureInfo);
    model.taskAreaInfo = AdminResult.createInstance(model.taskAreaInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.relationInfo = AdminResult.createInstance(model.relationInfo);


    model.inspectionLogs && (model.inspectionLogs = model.inspectionLogs.map(item => inspectionActionLogInterceptor.receive(item)))
    model.proposedInspectionTask && (model.proposedInspectionTask = proposedInspectionInterceptor.receive(model.proposedInspectionTask))
    model.dateFrom = DateUtils.changeDateToDatepicker(model.dateFrom);
    model.dateTo = DateUtils.changeDateToDatepicker(model.dateTo);
    model.licenseActivities = model.licenseActivities?.map(item => licenseActivityInterceptor.receive(item) as LicenseActivity);

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
    delete model.departmentInfo
    delete model.actualTaskInfo
    delete model.priorityInfo
    delete model.knownOrgInfo
    delete model.unknownOrgTypeInfo
    delete model.taskNatureInfo
    delete model.taskAreaInfo
    delete model.countryInfo
    delete model.relationInfo

  }
}
