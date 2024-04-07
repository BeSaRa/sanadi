import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { LicenseActivity } from "@app/models/license-activity";
import { ActualInspectionInterceptor } from "./actual-inspection-interceptor";
import { ActualInspection } from "@app/models/actual-inspection";

export class LicenseActivityInterceptor implements IModelInterceptor<LicenseActivity>
  {
  send(model: Partial<LicenseActivity>): Partial<LicenseActivity> {
    const actualInspectionInterceptor = new ActualInspectionInterceptor();
   model.actualInspection && (model.actualInspection = actualInspectionInterceptor.send(model.actualInspection) as ActualInspection) 
    LicenseActivityInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: LicenseActivity): LicenseActivity {

    const actualInspectionInterceptor = new ActualInspectionInterceptor(); //
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.licenseTypeInfo = AdminResult.createInstance(model.licenseTypeInfo);
    model.actualInspection = actualInspectionInterceptor.receive(model.actualInspection?? {} as ActualInspection);
    return model
  }
  private static _deleteBeforeSend(model: Partial<LicenseActivity>): void {
    delete model.employeeService;
    delete model.searchFields;
    delete model.service;
    delete model.arName;
    delete model.enName;
    delete model.statusInfo;
    delete model.licenseTypeInfo;
    
  }
}
