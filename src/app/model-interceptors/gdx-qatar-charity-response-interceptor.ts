import { AdminResult } from '@app/models/admin-result';
import { GdxQatarCharityResponse } from '@app/models/gdx-qatar-charity-response';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class GdxQatarCharityResponseInterceptor implements IModelInterceptor<GdxQatarCharityResponse> {
  receive(model: GdxQatarCharityResponse): GdxQatarCharityResponse {
    model.periodicTypeInfo = AdminResult.createInstance(model.periodicTypeInfo??{});
    model.aidLookupCategoryInfo = AdminResult.createInstance(model.aidLookupCategoryInfo??{});
    model.aidLookupParentInfo = AdminResult.createInstance(model.aidLookupParentInfo??{});
    model.aidLookupInfo = AdminResult.createInstance(model.aidLookupInfo??{});
    model.donorInfo = AdminResult.createInstance(model.donorInfo??{});
    return model;
  }

  send(model: Partial<GdxQatarCharityResponse>): Partial<GdxQatarCharityResponse> {
    delete model.periodicTypeInfo
    delete model.aidLookupCategoryInfo
    delete model.aidLookupParentInfo
    delete model.aidLookupInfo
    delete model.donorInfo
    return model;
  }
}
