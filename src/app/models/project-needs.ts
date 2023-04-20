import { IKeyValue } from '@app/interfaces/i-key-value';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';

export class ProjectNeed extends SearchableCloneable<ProjectNeed> {

  constructor() {
    super();
  }
  projectName!: string;
  projectDescription!: string;
  totalCost!: number;
  beneficiaries!: string;
  goals!: string;

  buildForm(withControls = true): IKeyValue {
    const { projectName, projectDescription, totalCost, beneficiaries, goals } = this;
    return {
      projectName: withControls ? [projectName, [CustomValidators.required, CustomValidators.maxLength(300)]] : projectName,
      projectDescription: withControls ? [projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : projectDescription,
      totalCost: withControls ? [totalCost, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(50)]] : totalCost,
      beneficiaries: withControls ? [beneficiaries, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : beneficiaries,
      goals: withControls ? [goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : goals,
    };
  }
  searchFields: ISearchFieldsMap<ProjectNeed> = {
    ...normalSearchFields(['projectName','projectDescription','totalCost','beneficiaries','goals'])
  };

}

export type ProjectNeeds = Partial<ProjectNeed>[];
