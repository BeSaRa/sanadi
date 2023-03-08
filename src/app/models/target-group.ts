import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";

export class TargetGroup extends SearchableCloneable<TargetGroup> {
  services!: string;
  targetedGroup!: string;

  getTargetGroupFields(control: boolean): any {
    const {services, targetedGroup} = this;

    return {
      services: control ? [services, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : services,
      targetedGroup: control ? [targetedGroup, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : targetedGroup
    };
  }
}
