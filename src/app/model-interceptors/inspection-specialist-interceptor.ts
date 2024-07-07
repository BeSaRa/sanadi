import { LinkedProjectTypes } from "@app/enums/linked-project-type.enum";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { LicenseActivity } from "@app/models/license-activity";
import { LicenseActivityInterceptor } from "./license-activity-interceptor";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { DateUtils } from "@app/helpers/date-utils";
import { InternalUserInterceptor } from "./internal-user-interceptor";
import { InternalUser } from "@app/models/internal-user";
import { ProposedInspectionInterceptor } from "./proposed_inspection-interceptor";
import { ProposedInspection } from "@app/models/proposed-inspection";
import { AdminResult } from "@app/models/admin-result";
import { InspectionSpecialist } from "@app/models/inspection-specialist";

export class inspectionSpecialistInterceptor implements IModelInterceptor<InspectionSpecialist>
{
  send(model: Partial<InspectionSpecialist>): Partial<InspectionSpecialist> {
   const internalUserInterceptor = new InternalUserInterceptor()
    model.internalSpecialist &&
     (model.internalSpecialist = internalUserInterceptor.send(model.internalSpecialist)as InternalUser)   
    inspectionSpecialistInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: InspectionSpecialist): InspectionSpecialist {
    const internalUserInterceptor = new InternalUserInterceptor()

    model.internalSpecialist &&
    (model.internalSpecialist = internalUserInterceptor.send(model.internalSpecialist)as InternalUser)
    return model
  }
  private static _deleteBeforeSend(model: Partial<InspectionSpecialist>): void {
    delete model.searchFields;
   

  }
}
