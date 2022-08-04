import { IKeyValue } from '@app/interfaces/i-key-value';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

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
      projectName: withControls ? [projectName, [CustomValidators.required]] : projectName,
      projectDescription: withControls ? [projectDescription, [CustomValidators.required]] : projectDescription,
      totalCost: withControls ? [totalCost, [CustomValidators.required, CustomValidators.decimal(2)]] : totalCost,
      beneficiaries: withControls ? [beneficiaries, [CustomValidators.required]] : beneficiaries,
      goals: withControls ? [goals, [CustomValidators.required]] : goals,
    };
  }

}

export type ProjectNeeds = Partial<ProjectNeed>[];
