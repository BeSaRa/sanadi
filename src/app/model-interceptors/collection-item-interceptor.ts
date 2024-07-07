import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CollectionItem} from "@app/models/collection-item";
import {AdminResult} from "@app/models/admin-result";
import {LicenseDurationType} from '@app/enums/license-duration-type';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

export class CollectionItemInterceptor implements IModelInterceptor<CollectionItem> {
  send(model: Partial<CollectionItem>): Partial<CollectionItem> {
    if (model.licenseDurationType === LicenseDurationType.PERMANENT){
      model.licenseEndDate = undefined;
    }
    model.licenseEndDate && (model.licenseEndDate = DateUtils.changeDateFromDatepicker(model.licenseEndDate as unknown as IMyDateModel)?.toISOString());
    delete model.licenseDurationTypeInfo;
    delete model.defaultLatLng;
    delete model.mapService;
    delete model.licenseStatusInfo;
    delete model.licenseEndDateString;
    return model
  }

  receive(model: CollectionItem): CollectionItem {
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo)
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo)
    model.licenseEndDateString = DateUtils.getDateStringFromDate(model.licenseEndDate);
    return model;
  }
}
