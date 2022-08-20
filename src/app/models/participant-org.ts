import { CustomValidators } from '../validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { Lookup } from '@app/models/lookup';
import { Validators } from '@angular/forms';

export class ParticipantOrg extends SearchableCloneable<ParticipantOrg> {
  organizationId!: number;
  arabicName!: string;
  englishName!: string;

  managerDecisionInfo!: Lookup;

  constructor() {
    super();
  }

  DisplayedColumns = ['arName', 'enName', 'actions'];

  BuildForm(controls?: boolean) {
    const { organizationId, arabicName, englishName } = this;
    return {
      organizationId: controls
        ? [
            organizationId,
            [Validators.required].concat(CustomValidators.number),
          ]
        : organizationId,
      arabicName: controls ? [arabicName, [Validators.required]] : arabicName,
      englishName: controls
        ? [englishName, [Validators.required]]
        : englishName,
    };
  }
}
