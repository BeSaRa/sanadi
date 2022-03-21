import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CollectionItem} from "@app/models/collection-item";
import {AdminResult} from "@app/models/admin-result";

export class CollectionItemInterceptor implements IModelInterceptor<CollectionItem> {
  send(model: Partial<CollectionItem>): Partial<CollectionItem> {
    delete model.licenseDurationTypeInfo;
    delete model.defaultLatLng;
    delete model.mapService;
    delete model.licenseStatusInfo;
    return model
  }

  receive(model: CollectionItem): CollectionItem {
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo)
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo)
    return model;
  }
}
