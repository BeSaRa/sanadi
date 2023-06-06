import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {NpoEmployee} from '@app/models/npo-employee';

export class NpoEmployeeInterceptor implements IModelInterceptor<NpoEmployee>{
  receive(model: NpoEmployee): NpoEmployee {

    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }

  send(model: Partial<NpoEmployee>): Partial<NpoEmployee> {
    delete model.langService;
    return model;
  }
}
