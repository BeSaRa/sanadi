import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class WorkArea extends SearchableCloneable<WorkArea> {
  arabicName!: string;
  englishName!: string;
  country!: number;
  objectDBId?: number;
  id!: number;
  countryInfo!: AdminResult;

  buildForm(controls = true) {
    const { arabicName, englishName, country } = this;

    return {
      arabicName: controls ? [arabicName, [CustomValidators.required]] : arabicName,
      englishName: controls ? [englishName, [CustomValidators.required]] : englishName,
      country: controls ? [country, [CustomValidators.required]] : country,

    }
  }
  toCharityOrgnizationUpdate() {
    const { arabicName, englishName, id, country } = this;
    return new WorkArea().clone({
      arabicName,
      englishName,
      objectDBId: id,
      country
    })
  }
}
