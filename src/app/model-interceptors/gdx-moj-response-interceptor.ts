import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMojResponse} from '@app/models/gdx-moj-response';
import {GdxFlatInfoInterceptor} from '@app/model-interceptors/gdx-flat-info-interceptor';
import {GdxParcelInfoInterceptor} from '@app/model-interceptors/gdx-parcel-info-interceptor';
import {GdxFlatInfo} from '@app/models/gdx-flat-info';
import {GdxParcelInfo} from '@app/models/gdx-parcel-info';

let gdxFlatInfoInterceptor = new GdxFlatInfoInterceptor();
let gdxParcelInfoInterceptor = new GdxParcelInfoInterceptor();

export class GdxMojResponseInterceptor implements IModelInterceptor<GdxMojResponse> {
  receive(model: GdxMojResponse): GdxMojResponse {
    model.flatInfoList = model.flatInfoList.map((x)=> {
      return gdxFlatInfoInterceptor.receive(new GdxFlatInfo().clone(x));
    });
    model.parcelInfoList = model.parcelInfoList.map((x)=> {
      return gdxParcelInfoInterceptor.receive(new GdxParcelInfo().clone(x));
    });
    return model;
  }

  send(model: Partial<GdxMojResponse>): Partial<GdxMojResponse> {
    model.flatInfoList = !model.flatInfoList ? [] : model.flatInfoList.map((x)=> {
      return gdxFlatInfoInterceptor.send(x) as GdxFlatInfo;
    });
    model.parcelInfoList = !model.parcelInfoList ? [] : model.parcelInfoList.map((x)=> {
      return gdxParcelInfoInterceptor.send(x) as GdxParcelInfo;
    });
    return model;
  }
}
