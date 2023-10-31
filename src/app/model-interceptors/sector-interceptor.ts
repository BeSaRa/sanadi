import { Sector } from '@app/models/sector';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class SectorInterceptor implements IModelInterceptor<Sector> {
  receive(model:Sector):Sector {
     return model;
  }

  send(model: Partial<Sector>): Partial<Sector> {
   SectorInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Sector> | any): void {
    delete model.service;
    delete model.searchFields;
    delete model.statusInfo;
  }

}
