import {AdminResult} from "./admin-result";
import {Cloneable} from "@app/models/cloneable";

export class AmountOverCountry extends Cloneable<AmountOverCountry> {
  targetAmount!: number;
  country!: number;
  countryInfo!: AdminResult
}
