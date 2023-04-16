import { AdminResult } from "./admin-result";
import { Cloneable } from "@app/models/cloneable";
import { Observable } from "rxjs";
import { FactoryService } from "@app/services/factory.service";
import { map } from "rxjs/operators";
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { InterceptModel } from "@decorators/intercept-model";
import { FieldAssessmentServiceLinkService } from "@app/services/field-assessment-service-link.service";
import { FieldAssessmentServiceLinkInterceptor } from "@app/model-interceptors/field-assessment-service-interceptor";

const interceptor = new FieldAssessmentServiceLinkInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class FieldAssessmentServiceLink extends Cloneable<FieldAssessmentServiceLink> {
  id!: number;
  serviceId!: number;
  serviceInfo!: AdminResult;
  status!: number;
  // not related to the model
  arName?: string;
  enName?: string;
  service!: FieldAssessmentServiceLinkService

  constructor() {
    super();
    this.service = FactoryService.getService('FieldAssessmentServiceLinkService');
  }

  denormalize(): FieldAssessmentServiceLink {
    this.arName = this.serviceInfo.arName;
    this.enName = this.serviceInfo.enName;
    return this;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  toggleStatus(): Observable<boolean> {
    return this.status ? this.deactivate() : this.activate();
  }

  activate(): Observable<boolean> {
    return this.service.activate([this.id]).pipe(map(i => i[this.id]));
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate([this.id]).pipe(map(i => i[this.id]));
  }

  delete(): Observable<boolean> {
    return this.service.deleteBulk([this.id]).pipe(map(i => i[this.id]));
  }
}
