import {AdminResult} from "@app/models/admin-result";
import {Cloneable} from "@app/models/cloneable";

export class DeductedPercentage extends Cloneable<DeductedPercentage> {
  deductionType!: number;
  deductionTypeInfo!: AdminResult;
  deductionPercent!: number
}

