import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { SearchableCloneable } from "./searchable-cloneable";

export class EvaluationAxis extends SearchableCloneable<EvaluationAxis>{
    evaluationAxisId!: number;
    evaluationValue!: number;
    notes!:string;
    itemId!: string;
    evaluationAxisInfo!:AdminResult


    buildForm(controls?: boolean): any {
      const {evaluationAxisId, evaluationValue, notes,evaluationAxisInfo} = this;
      return {
        // evaluationAxisId:controls ? [evaluationAxisId, [CustomValidators.required]] : evaluationAxisId,
        evaluationValue: controls ? [evaluationValue, []] : evaluationValue,
        notes: controls ? [notes, []] : notes,
        evaluationAxisInfo

      }
    }
}