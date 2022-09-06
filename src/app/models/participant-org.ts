import { Validators } from '@angular/forms';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { CustomValidators } from '../validators/custom-validators';

export class ParticipantOrg extends SearchableCloneable<ParticipantOrg> {
  organizationId!: number;
  arabicName!: string;
  englishName!: string;

  managerDecisionInfo!: AdminResult;

  constructor() {
    super();
  }

  DisplayedColumns = ['arName', 'enName', 'managerDecisionInfo','actions'];

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
