import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { FactoryService } from '@app/services/factory.service';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class Member extends SearchableCloneable<Member> {
  name!: string;
  personalNumber!: string;
  position!: number;
  positionInfo!: AdminResult;

  lang: LangService = FactoryService.getService('LangService');


  buildForm(controls = true) {
    const { name, personalNumber, position } = this;
    return {
      name: controls
        ? [
          name,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : name,
      personalNumber: controls
        ? [personalNumber, [CustomValidators.required]]
        : personalNumber,
      position: controls ? [position, [CustomValidators.required]] : position,
    };
  }
}
