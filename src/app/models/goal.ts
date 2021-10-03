import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {AdminResult} from "@app/models/admin-result";

export class Goal extends SearchableCloneable<Goal> {
  goal!: string;
  domain!: number;
  mainDACCategory!: number | null;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategory!: number | null;
  mainUNOCHACategoryInfo!: AdminResult;
  workArea!: string

  getGoalFields(control: boolean): any {
    const {
      goal,
      domain,
      mainDACCategory,
      mainUNOCHACategory,
      workArea,
      mainDACCategoryInfo,
      mainUNOCHACategoryInfo
    } = this;

    return {
      goal: control ? [goal, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : goal,
      domain: control ? [domain, CustomValidators.required] : domain,
      mainDACCategory: control ? [mainDACCategory] : mainDACCategory,
      mainUNOCHACategory: control ? [mainUNOCHACategory] : mainUNOCHACategory,
      workArea: control ? [workArea, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : workArea,
      mainDACCategoryInfo: control ? [mainDACCategoryInfo] : mainDACCategoryInfo,
      mainUNOCHACategoryInfo: control ? [mainUNOCHACategoryInfo] : mainUNOCHACategoryInfo
    };
  }

  setOUCHAInfo() {

  }
}
