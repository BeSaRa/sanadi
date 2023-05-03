import { IKeyValue } from '@app/interfaces/i-key-value';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { CustomValidators } from '@app/validators/custom-validators';

export class ProjectModelForeignCountriesProject extends SearchableCloneable<ProjectModelForeignCountriesProject> {
  objectDBId!: number;
  projectName!: string;
  notes!: string;
  buildForm(withControls = true): IKeyValue {
    const { 
      notes,
      objectDBId
    } = this;
    return {
      objectDBId: withControls? [objectDBId, [CustomValidators.required]] : objectDBId,
      notes: withControls? [notes]: notes
    };
  }
}
