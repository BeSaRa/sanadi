import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

export class WorkArea extends SearchableCloneable<WorkArea> {
  arabicName!: string;
  englishName!: string;
  country!: number;

  buildForm(controls = true) {
    const { arabicName, englishName, country } = this;

    return {
      arabicName: controls ? [arabicName, [CustomValidators.required]] : arabicName,
      englishName: controls ? [englishName, [CustomValidators.required]] : englishName,
      country: controls ? [country, [CustomValidators.required]] : country,

    }
  }
}
