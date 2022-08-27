import { Annotation } from './annotation';
import { RecommendationInterceptor } from "@app/model-interceptors/recommendation-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new RecommendationInterceptor();

@InterceptModel({ send, receive })
export class Recommendation extends Annotation<Recommendation> {
  CLASSNAME!: string;
}
