import { CounterContract } from "@contracts/counter-contract";
import { FlagsContract } from "@contracts/flags-contract";

export class Common {
  counters!: CounterContract
  flags!: FlagsContract
}
