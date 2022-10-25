import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class WorkArea extends SearchableCloneable<WorkArea> {
  arabicName!: string;
  englishName!: string;
  country!: number;
  region!:string;
  objectDBId?: number;
  id!: number;
  countryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<WorkArea> = {
    ...infoSearchFields(['countryInfo']),
    ...normalSearchFields(['region'])
  };

  buildForm(controls = true) {
    const { country ,region} = this;

    return {
      country: controls ? [country, [CustomValidators.required]] : country,
      region: controls ? [region, [CustomValidators.required,CustomValidators.maxLength(50)]] : region,

    }
  }
  toCharityOrgnizationUpdate() {
    const { id, country } = this;
    return new WorkArea().clone({
      objectDBId: id,
      country
    })
  }
}
