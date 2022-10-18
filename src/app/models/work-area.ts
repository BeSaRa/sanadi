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
    const { country } = this;

    return {
      country: controls ? [country, [CustomValidators.required]] : country,

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
