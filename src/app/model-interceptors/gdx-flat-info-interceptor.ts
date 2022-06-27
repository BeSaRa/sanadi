import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxFlatInfo} from '@app/models/gdx-flat-info';

export class GdxFlatInfoInterceptor implements IModelInterceptor<GdxFlatInfo> {
  receive(model: GdxFlatInfo): GdxFlatInfo {
    return model;
  }

  send(model: Partial<GdxFlatInfo>): Partial<GdxFlatInfo> {
    return model;
  }
}
