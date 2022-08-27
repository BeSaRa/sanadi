import { BaseLicense } from "@app/models/base-license";
import { AdminResult } from "@app/models/admin-result";
import { InterceptModel } from "@decorators/intercept-model";
import { InitialApprovalDocumentInterceptor } from "@app/model-interceptors/initial-approval-document-interceptor";

const { send, receive } = new InitialApprovalDocumentInterceptor();

@InterceptModel({ send, receive })
export class InitialExternalOfficeApprovalResult extends BaseLicense {
  enName!: string;
  arName!: string;
  country!: number;
  region!: string;
  customTerms!: string;
  publicTerms!: string;
  countryInfo!: AdminResult;
  // regionInfo!: AdminResult;
}
