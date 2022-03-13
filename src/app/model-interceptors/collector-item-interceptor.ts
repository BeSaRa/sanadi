import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorItem} from '@app/models/collector-item';
import {DateUtils} from '@app/helpers/date-utils';
import {AdminResult} from '@app/models/admin-result';

export class CollectorItemInterceptor implements IModelInterceptor<CollectorItem> {
  send(model: Partial<CollectorItem>): Partial<CollectorItem> {
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    delete model.collectorTypeInfo;
    return model;
  }

  receive(model: CollectorItem): CollectorItem {
    model.collectorTypeInfo = AdminResult.createInstance(model.collectorTypeInfo);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    return model;
  }
}
