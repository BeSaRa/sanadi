import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxParcelInfo} from '@app/models/gdx-parcel-info';

export class GdxParcelInfoInterceptor implements IModelInterceptor<GdxParcelInfo>{
  receive(model: GdxParcelInfo): GdxParcelInfo {
    return model;
  }

  send(model: Partial<GdxParcelInfo>): Partial<GdxParcelInfo> {
    return model;
  }
}
