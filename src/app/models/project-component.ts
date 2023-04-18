import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';

export class ProjectComponent extends SearchableCloneable<ProjectComponent> {
  componentName!: string;
  details!: string;
  totalCost!: number;

  buildForm(control: boolean = false): any {
    const {
      componentName,
      details,
      totalCost
    } = this;

    return {
      componentName: control ? [componentName, [CustomValidators.required, CustomValidators.maxLength(100)]] : componentName,
      details: control ? [details, [CustomValidators.required, CustomValidators.maxLength(250)]] : details,
      totalCost: control ? [totalCost, [CustomValidators.required].concat(CustomValidators.commonValidations.decimalWithMinValue(2), CustomValidators.maxLength(20))] : totalCost
    }
  }
  searchFields: ISearchFieldsMap<ProjectComponent> = {
    ...normalSearchFields(['componentName','details','totalCost'])
  };
}
