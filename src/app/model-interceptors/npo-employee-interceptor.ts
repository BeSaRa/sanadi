import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {NpoEmployee} from '@app/models/npo-employee';

export class NpoEmployeeInterceptor implements IModelInterceptor<NpoEmployee>{
  receive(model: NpoEmployee): NpoEmployee {

    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
    model.contractLocationInfo = AdminResult.createInstance(model.contractLocationInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }

  send(model: Partial<NpoEmployee>): Partial<NpoEmployee> {
    delete model.langService;
    delete model.statusInfo;
    delete model.contractLocationInfo;
    delete model.nationalityInfo;
    return model;
  }
}
