import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

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
      details: control ? [details, [CustomValidators.required, CustomValidators.maxLength(1200)]] : details,
      totalCost: control ? [totalCost, [CustomValidators.required].concat(CustomValidators.commonValidations.decimalWithMinValue(2))] : totalCost
    }
  }
}
