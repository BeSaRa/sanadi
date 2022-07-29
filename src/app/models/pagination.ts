import { IDefaultResponse } from "@contracts/idefault-response";

export class Pagination<T> implements IDefaultResponse<T> {
  count!: number;
  rs!: T;
  sc!: number;
}
