import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class OrgMember extends SearchableCloneable<OrgMember> {
  objectDBId!: number;
  identificationNumber!: string;
  fullName!: string;
  jobTitleId!: number;
  email!: string;
  phone!: string;
  joinDate!: string;
  nationality!: number;
  extraPhone!: string;
  jobTitleInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  buildForm(controls = true) {
    const { fullName, identificationNumber, jobTitleId } = this;
    return {
      fullName: controls
        ? [
          fullName,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : fullName,
      identificationNumber: controls
        ? [identificationNumber, [CustomValidators.required]]
        : identificationNumber,
      jobTitleId: controls ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
    };
  }
  bulildExtendedForm(controls = true) {
    const form = this.buildForm(controls);
    const { joinDate, email, phone } = this;
    return {
      ...form,
      joinDate: controls ? [joinDate, [CustomValidators.required]] : joinDate,
      email: controls ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: controls ? [phone, [CustomValidators.required]] : phone,
    }
  }
}
