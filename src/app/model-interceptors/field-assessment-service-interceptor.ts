import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { FieldAssessmentServiceLink } from "@app/models/field-assessment-service";

export class FieldAssessmentServiceLinkInterceptor implements IModelInterceptor<FieldAssessmentServiceLink> {
  send(model: Partial<FieldAssessmentServiceLink>): Partial<FieldAssessmentServiceLink> {
    delete model.serviceInfo;
    delete model.arName;
    delete model.enName;
    return model;
  }

  receive(model: FieldAssessmentServiceLink): FieldAssessmentServiceLink {
    model.serviceInfo = AdminResult.createInstance(model.serviceInfo);
    model.arName = model.serviceInfo.arName;
    model.enName = model.serviceInfo.enName;
    return model;
  }
}
