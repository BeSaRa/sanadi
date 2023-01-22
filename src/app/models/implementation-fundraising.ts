import {AdminResult} from "@models/admin-result";
import {Cloneable} from "@models/cloneable";

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
  permitTypeInfo!: AdminResult
}
