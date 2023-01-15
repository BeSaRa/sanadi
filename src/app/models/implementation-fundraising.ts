import {AdminResult} from "@models/admin-result";

export class ImplementationFundraising {
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
