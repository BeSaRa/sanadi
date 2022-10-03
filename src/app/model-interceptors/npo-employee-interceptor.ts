import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Lookup } from '@app/models/lookup';
import { NpoEmployee } from '@app/models/npo-employee';
import { FactoryService } from '@app/services/factory.service';
import { LookupService } from '@app/services/lookup.service';

export class NpoEmployeeInterceptor implements IModelInterceptor<NpoEmployee>{
  receive(model: NpoEmployee): NpoEmployee {

    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
    model.jobTitleInfo = (new Lookup()).clone(model.jobTitleInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    return model;
  }

  send(model: Partial<NpoEmployee>): Partial<NpoEmployee> {
    delete model.langService;
    return model;
  }
}
