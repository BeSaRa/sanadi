import { BaseLicense } from '@app/models/base-license';
import { InterceptModel } from "@decorators/intercept-model";
import {
  UrgentInterventionLicenseResultInterceptor
} from "@app/model-interceptors/urgent-intervention-license-result-interceptor";

const { send, receive } = new UrgentInterventionLicenseResultInterceptor();

@InterceptModel({ send, receive })
export class UrgentInterventionLicenseResult extends BaseLicense {
}
