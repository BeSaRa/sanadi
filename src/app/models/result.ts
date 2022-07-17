import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';

export class Result extends SearchableCloneable<Result> {
  outputs!: string;
  expectedResults!: string;
  expectedImpact!: string;

  constructor() {
    super();
  }

  searchFields: ISearchFieldsMap<Result> = {
    ...normalSearchFields(['outputs', 'expectedImpact', 'expectedResults'])
  };

  buildForm(controls: boolean = false) {
    const {outputs, expectedResults, expectedImpact} = this;
    return {
      outputs: controls ? [outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : outputs,
      expectedImpact: controls ? [expectedImpact, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedImpact,
      expectedResults: controls ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedResults
    };
  }
}
