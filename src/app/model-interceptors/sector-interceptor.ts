import {Sector} from '@app/models/sector';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {AdminResult} from "@models/admin-result";

export class SectorInterceptor implements IModelInterceptor<Sector> {
  receive(model: Sector): Sector {
    model.departmentInfo && (model.departmentInfo = AdminResult.createInstance(model.departmentInfo));
    return model;
  }

  send(model: Partial<Sector>): Partial<Sector> {
    SectorInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Sector> | any): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.departmentInfo;
  }

}
