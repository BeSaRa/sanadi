import { SubventionRequest } from './subvention-request';
import { Beneficiary } from './beneficiary';
import { SubventionAid } from './subvention-aid';
import { SanadiAttachment } from './sanadi-attachment';
import { Cloneable } from './cloneable';
import { InterceptModel } from "@decorators/intercept-model";
import { SubventionResponseInterceptor } from "@app/model-interceptors/subvention-response-interceptor";

const { receive, send } = new SubventionResponseInterceptor()

@InterceptModel({ receive, send })
export class SubventionResponse extends Cloneable<SubventionResponse> {
  request!: SubventionRequest;
  beneficiary!: Beneficiary;
  aidList!: SubventionAid[];
  attachmentList!: SanadiAttachment[];
}
