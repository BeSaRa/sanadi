import {Cloneable} from "@app/models/cloneable";

export class AmountOverYear extends Cloneable<AmountOverYear> {
  year!: string;
  targetAmount!: number;
}
