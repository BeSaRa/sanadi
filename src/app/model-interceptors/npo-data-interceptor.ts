import { Profile } from '@app/models/profile';
import { NpoData } from './../models/npo-data';
import { AdminResult } from '../models/admin-result';
import { DateUtils } from '../helpers/date-utils';
import { IModelInterceptor } from '@contracts/i-model-interceptor';


export class NpoDataInterceptor implements IModelInterceptor<NpoData> {
  receive(model: NpoData): NpoData {
    model.activityTypeInfo && (model.activityTypeInfo = AdminResult.createInstance(model.activityTypeInfo));
    model.clearanceInfo && (model.clearanceInfo = AdminResult.createInstance(model.clearanceInfo));
    model.disbandmentInfo && (model.disbandmentInfo = AdminResult.createInstance(model.disbandmentInfo));
    model.registrationAuthorityInfo && (model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo));

    model.establishmentDate = DateUtils.changeDateToDatepicker(model.establishmentDate);
    model.disbandmentDate = DateUtils.changeDateToDatepicker(model.disbandmentDate);
    model.clearanceDate = DateUtils.changeDateToDatepicker(model.clearanceDate);
    model.registrationDate = DateUtils.changeDateToDatepicker(model.registrationDate);

    return model;
  }

  send(model: NpoData): NpoData {
    // to used yet
    NpoDataInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NpoData>): void {
    delete model.searchFields;
    delete model.activityTypeInfo;
    delete model.profileInfo;
    delete model.clearanceInfo;
    delete model.disbandmentInfo;
    delete model.registrationAuthorityInfo;
  }
}
