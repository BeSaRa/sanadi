import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';

export class InterventionField extends SearchableCloneable<InterventionField> {
  mainUNOCHACategory!: number;
  subUNOCHACategory!: number;
  mainUNOCHACategoryInfo!: AdminResult;
  subUNOCHACategoryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<InterventionField> = {
    ...infoSearchFields(['mainUNOCHACategoryInfo', 'subUNOCHACategoryInfo'])
  };

  getInterventionFieldForm(controls: boolean = false) {
    const {mainUNOCHACategory, subUNOCHACategory} = this;
    return {
      mainUNOCHACategory: controls ? [mainUNOCHACategory, [CustomValidators.required]] : mainUNOCHACategory,
      subUNOCHACategory: controls ? [subUNOCHACategory, [CustomValidators.required]] : subUNOCHACategory
    }
  }
}
