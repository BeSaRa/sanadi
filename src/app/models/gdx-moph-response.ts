import {InterceptModel} from '@decorators/intercept-model';
import {GdxMophResponseInterceptor} from '@app/model-interceptors/gdx-moph-response-interceptor';

const gdxMophResponseInterceptor = new GdxMophResponseInterceptor();

@InterceptModel({
  receive: gdxMophResponseInterceptor.receive
})
export class GdxMophResponse {
  qId!: string;
  deathDate!: string;
  deathTime!: string;
  regNo!: string;
  arFullName!: string;
  enFullName!: string;
  isDead!: boolean;
}
