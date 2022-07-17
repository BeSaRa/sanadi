import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';

export class OfficeEvaluation extends SearchableCloneable<OfficeEvaluation>{
  evaluationHub!: number;
  evaluationResult!: number;
  notes!: string;
  evaluationHubInfo!: AdminResult;
  evaluationResultInfo!: AdminResult;

  constructor() {
    super();
  }

  searchFields: ISearchFieldsMap<OfficeEvaluation> = {
    ...normalSearchFields(['notes']),
    ...infoSearchFields(['evaluationHubInfo', 'evaluationResultInfo'])
  }

  buildForm(controls?: boolean) {
    const {evaluationHub, evaluationResult, notes} = this;
    return {
      evaluationHub: controls ? [evaluationHub, [CustomValidators.required]] : evaluationHub,
      evaluationResult: controls ? [evaluationResult, [CustomValidators.required]] : evaluationResult,
      notes: controls ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : notes
    };
  }
}
