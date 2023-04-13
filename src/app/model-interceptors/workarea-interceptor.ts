import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { WorkArea } from '@app/models/work-area';

export class WorkAreaInterceptor implements IModelInterceptor<WorkArea> {
  caseInterceptor?: IModelInterceptor<WorkArea> | undefined;
  send(model: Partial<WorkArea>): Partial<WorkArea> {
    model.arabicName = model.countryInfo?.arName;
    model.englishName = model.countryInfo?.enName;
    delete model.searchFields;
    delete model.countryInfo;
    delete model.auditOperation;
    return model;
  }
  receive(model: WorkArea): WorkArea {
    model.countryInfo = AdminResult.createInstance({ arName: model.arabicName, enName: model.englishName, id: model.country });
    return model;
  }
}
