import {GdxFlatInfo} from '@app/models/gdx-flat-info';
import {GdxParcelInfo} from '@app/models/gdx-parcel-info';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxMojResponseInterceptor} from '@app/model-interceptors/gdx-moj-response-interceptor';

const gdxMojResponseInterceptor = new GdxMojResponseInterceptor();

@InterceptModel({
  receive: gdxMojResponseInterceptor.receive
})
export class GdxMojResponse {
  flatInfoList: GdxFlatInfo[] = [];
  parcelInfoList: GdxParcelInfo[] = [];
}
