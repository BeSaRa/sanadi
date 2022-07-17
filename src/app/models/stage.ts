import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {normalSearchFields} from '@helpers/normal-search-fields';

export class Stage extends SearchableCloneable<Stage> {
  stage!: string;
  notes!: string;
  interventionCost!: number;
  duration!: number;

  searchFields: ISearchFieldsMap<Stage> = {
    ...normalSearchFields(['stage', 'duration', 'interventionCost', 'notes'])
  };

  buildForm(controls: boolean = false) {
    const {stage, duration, interventionCost, notes} = this;
    return {
      stage: controls ? [stage, [CustomValidators.required]] : stage,
      duration: controls ? [duration, [CustomValidators.required, CustomValidators.number]] : duration,
      interventionCost: controls ? [interventionCost, [CustomValidators.required, CustomValidators.decimal(2)]] : interventionCost,
      notes: controls ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]: notes
    };
  }
}
