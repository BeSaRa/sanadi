import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Bylaw } from '@app/models/bylaw';

export class ByLawInterceptor implements IModelInterceptor<Bylaw> {
  caseInterceptor?: IModelInterceptor<Bylaw> | undefined;
  send(model: Partial<Bylaw>): Partial<Bylaw> {
    delete model.searchFields;
    delete model.categoryInfo;
    return model;
  }
  receive(model: Bylaw): Bylaw {
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate);
    model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate);
    return model;
  }
}
