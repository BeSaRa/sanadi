import {AdminResult} from "@models/admin-result";
import {Cloneable} from "@models/cloneable";
import {ImplementationFundraisingInterceptor} from "@model-interceptors/implementation-fundraising-interceptor";
import {InterceptModel} from "@decorators/intercept-model";

const {send, receive} = new ImplementationFundraisingInterceptor()

@InterceptModel({send, receive})
export class ImplementationFundraising extends Cloneable<ImplementationFundraising> {
  arName!: string
  enName!: string
  projectLicenseFullSerial!: string
  projectLicenseSerial!: number
  projectLicenseId!: string
  permitType!: number
  projectTotalCost!: number
  remainingAmount!: number
  consumedAmount!: number
  totalCost!: number
  notes!: string
  templateId?: string
  permitTypeInfo!: AdminResult

}
