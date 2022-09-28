import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { OrgMemberInterceptor } from '@app/model-interceptors/org-member-interceptor';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
const { send, receive } = new OrgMemberInterceptor();

@InterceptModel({
  receive, send
})
export class OrgMember extends SearchableCloneable<OrgMember> {
  objectDBId!: number;
  qid?: string;
  identificationNumber!: string;
  fullName!: string;
  id!: number;
  jobTitleId!: number;
  email: string | null = null;
  phone: string | null = null;
  joinDate: string | null | IMyDateModel = null;
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
