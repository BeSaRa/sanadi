import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {Constructor} from "@app/helpers/constructor";
import {HasLicenseDurationType} from "@app/interfaces/has-license-duration-type";


type CanLicenseDurationType = Constructor<HasLicenseDurationType> & AbstractConstructor<HasLicenseDurationType>;

export function mixinLicenseDurationType<T extends AbstractConstructor<{}>>(bas: T): CanLicenseDurationType & T;
export function mixinLicenseDurationType<T extends Constructor<{}>>(bas: T): CanLicenseDurationType & T {
  return class extends bas {
    licenseDurationType!: number;
    getLicenseDurationType(): number {
      return this.licenseDurationType;
    };
  };
}
