import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ServiceDataStep} from '@app/models/service-data-step';

export class ServiceDataStepInterceptor implements IModelInterceptor<ServiceDataStep>{
  receive(model: ServiceDataStep): ServiceDataStep {
    return model;
  }

  send(model: Partial<ServiceDataStep>): Partial<ServiceDataStep> {
    return model;
  }
}
