import {Cloneable} from "@models/cloneable";
import {FundingResourceContract} from "@contracts/funding-resource-contract";

export class FundSource extends Cloneable<FundSource> implements FundingResourceContract {
  fullName!: string;
  totalCost!: number;
  notes!: string;
}
