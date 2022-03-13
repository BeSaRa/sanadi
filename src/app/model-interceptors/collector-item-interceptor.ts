import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorItem} from '@app/models/collector-item';
import {DateUtils} from '@app/helpers/date-utils';

export class CollectorItemInterceptor implements IModelInterceptor<CollectorItem> {
  send(model: Partial<CollectorItem>): Partial<CollectorItem> {
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    return model;
  }

  receive(model: CollectorItem): CollectorItem {
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    return model;
  }
}
