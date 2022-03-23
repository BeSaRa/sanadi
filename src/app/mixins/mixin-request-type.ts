import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {Constructor} from "@app/helpers/constructor";
import {HasRequestType} from "@app/interfaces/has-request-type";
import {AdminResult} from "@app/models/admin-result";

type CanRequestType = Constructor<HasRequestType> & AbstractConstructor<HasRequestType>;

export function mixinRequestType<T extends AbstractConstructor<{}>>(bas: T): CanRequestType & T;
export function mixinRequestType<T extends Constructor<{}>>(bas: T): CanRequestType & T {
  return class extends bas {
    requestType!: number;
    requestTypeInfo!:AdminResult
    getRequestType(): number {
      return this.requestType;
    };
  };
}
