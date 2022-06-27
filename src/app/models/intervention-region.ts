import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class InterventionRegion extends SearchableCloneable<InterventionRegion>{
  description!: string;
  region!: string;

  searchFields: ISearchFieldsMap<InterventionRegion> = {
    ...normalSearchFields(['region', 'description'])
  };

  constructor() {
    super();
  }

  getRegionFields(controls: boolean = false) {
    const {region, description} = this;
    return {
      region: controls ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]] : region,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }
}
