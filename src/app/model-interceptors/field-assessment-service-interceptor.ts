import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { FieldAssessmentServiceLink } from "@app/models/field-assessment-service";

export class FieldAssessmentServiceLinkInterceptor implements IModelInterceptor<FieldAssessmentServiceLink> {
  send(model: Partial<FieldAssessmentServiceLink>): Partial<FieldAssessmentServiceLink> {
    delete model.serviceDataInfo;
    delete model.arName;
    delete model.enName;
    return model;
  }

  receive(model: FieldAssessmentServiceLink): FieldAssessmentServiceLink {
    model.serviceDataInfo = AdminResult.createInstance(model.serviceDataInfo);
    model.arName = model.serviceDataInfo.arName;
    model.enName = model.serviceDataInfo.enName;
    return model;
  }
}
