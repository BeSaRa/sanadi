import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorItem} from '@app/models/collector-item';
import {DateUtils} from '@app/helpers/date-utils';
import {AdminResult} from '@app/models/admin-result';

export class CollectorItemInterceptor implements IModelInterceptor<CollectorItem> {
  send(model: Partial<CollectorItem>): Partial<CollectorItem> {
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    delete model.collectorTypeInfo;
    delete model.licenseStatusInfo;
    delete model.licenseDurationTypeInfo;
    delete model.relationshipInfo;
    delete model.genderInfo;
    delete model.nationalityInfo;
    return model;
  }

  receive(model: CollectorItem): CollectorItem {
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo);
    model.genderInfo = AdminResult.createInstance(model.genderInfo);
    model.relationshipInfo = AdminResult.createInstance(model.relationshipInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.collectorTypeInfo = AdminResult.createInstance(model.collectorTypeInfo);
    return model;
  }
}
