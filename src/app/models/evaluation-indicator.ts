import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';

export class EvaluationIndicator extends SearchableCloneable<EvaluationIndicator> {
  indicator!: number;
  percentage!: number;
  notes!: string;
  indicatorInfo?: AdminResult;

  buildForm(controls?: boolean): any {
    const {
      indicator,
      percentage, 
      notes
    } = this;
    return {
      indicator: controls ? [indicator, [
        CustomValidators.required,
      ]] : indicator,
      percentage: controls ? [percentage, [
        CustomValidators.required,
        Validators.max(100), 
        CustomValidators.decimal(2)
      ]] : percentage,
      notes: controls ? [notes, [CustomValidators.required]] : notes
    }
  }
}
