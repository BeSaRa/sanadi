import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InterventionRegion} from '@app/models/intervention-region';

export class InterventionRegionInterceptor implements IModelInterceptor<InterventionRegion>{
  receive(model: InterventionRegion): InterventionRegion {
    return model;
  }

  send(model: Partial<InterventionRegion>): Partial<InterventionRegion> {
    InterventionRegionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<InterventionRegion>): void {
    delete model.searchFields;
  }
}
