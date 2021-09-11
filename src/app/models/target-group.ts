import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";

export class TargetGroup extends SearchableCloneable<TargetGroup> {
  services!: string;
  targetedGroup!: string;

  getTargetGroupFields(control: boolean): any {
    const {services, targetedGroup} = this;

    return {
      services: control ? [services, CustomValidators.required] : services,
      targetedGroup: control ? [targetedGroup, CustomValidators.required] : targetedGroup
    };
  }
}
