import { BaseLicense } from './base-license';
import { InterceptModel } from "@decorators/intercept-model";
import {
  ForeignCountriesProjectsResultInterceptor
} from "@app/model-interceptors/foreign-countries-projects-result-interceptor";


const { send, receive } = new ForeignCountriesProjectsResultInterceptor();
@InterceptModel({ send, receive })
export class ForeignCountriesProjectsResult extends BaseLicense {
}
