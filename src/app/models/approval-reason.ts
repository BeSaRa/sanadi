import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";

export class ApprovalReason extends SearchableCloneable<ApprovalReason> {
  projects!: string;
  research!: string;
  fieldVisit!: string;
  description!: string;

  getApprovalReasonFields(control: boolean): any {
    const {description, fieldVisit, projects, research} = this;

    return {
      projects: control ? [projects, CustomValidators.required] : projects,
      research: control ? [research, CustomValidators.required] : research,
      fieldVisit: control ? [fieldVisit, CustomValidators.required] : fieldVisit,
      description: control ? [description, CustomValidators.required] : description
    };
  }
}
