import {BaseModel} from '@app/models/base-model';
import {ServiceDataStepService} from '@app/services/service-data-step.service';

export class ServiceDataStep extends BaseModel<ServiceDataStep, ServiceDataStepService>{
  service!: ServiceDataStepService;

  serviceId!: number;
  caseType!: number;
  activityName!: string;
  readonly stepName!: string;
  arDesc!: string;
  enDesc!: string;

  loadSteps() {
    return this.service.stepsByServiceId(this.id);
  }
}
