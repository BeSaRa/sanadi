import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";

export class ApprovalReason extends SearchableCloneable<ApprovalReason> {
  projects!: string;
  research!: string;
  fieldVisit!: string;

  searchFields: ISearchFieldsMap<ApprovalReason> = {
    ...normalSearchFields(['projects','research','fieldVisit'])
  };
  getApprovalReasonFields(control: boolean): any {
    const { fieldVisit, projects, research} = this;

    return {
      projects: control ? [projects,[ CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : projects,
      research: control ? [research,[ CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : research,
      fieldVisit: control ? [fieldVisit,[ CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : fieldVisit,
    };
  }
}
