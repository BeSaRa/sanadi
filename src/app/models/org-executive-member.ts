import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {DateUtils} from '@app/helpers/date-utils';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {AdminResult} from './admin-result';
import {SearchableCloneable} from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {CommonUtils} from '@app/helpers/common-utils';
import { OrgExecutiveMemberInterceptor } from '@app/model-interceptors/org-executive-member-interceptor';
import { ObjectUtils } from '@app/helpers/object-utils';

const {send, receive} = new OrgExecutiveMemberInterceptor();

@InterceptModel({
  receive,
  send,
})
export class OrgExecutiveMember extends SearchableCloneable<OrgExecutiveMember> implements IAuditModelProperties<OrgExecutiveMember> {
  objectDBId!: number;
  qid?: string;
  identificationNumber!: string;
  fullName!: string;
  id!: number;
  itemId!: string;
  jobTitle!: string;
  email: string | null = null;
  phone: string | null = null;
  joinDate: string | null | IMyDateModel = null;
  nationality!: number;
  extraPhone!: string;
  nationalityInfo!: AdminResult;

  searchFields: ISearchFieldsMap<OrgExecutiveMember> = {
    ...normalSearchFields(['qid', 'fullName', 'identificationNumber', 'email', 'phone', 'extraPhone']),
    ...infoSearchFields(['nationalityInfo'])
  }
  joinDateStamp!: number | null;

  getAdminResultByProperty(property: keyof OrgExecutiveMember): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'nationality':
        adminResultValue = this.nationalityInfo;
        break;
      case 'joinDate':
        const joinDateValue = DateUtils.getDateStringFromDate(this.joinDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: joinDateValue, enName: joinDateValue});
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: {langKey: 'full_name', value: this.fullName},
      identificationNumber: {langKey: 'identification_number', value: this.identificationNumber},
      jobTitle: {langKey: 'job_title', value: this.jobTitle},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_phone', value: this.phone},
      joinDate: {langKey: 'first_join_date', value: this.joinDate, comparisonValue: this.joinDateStamp},
      nationality: {langKey: 'lbl_nationality', value: this.nationality},
      extraPhone: {langKey: 'lbl_extra_phone_number', value: this.extraPhone},
    };

  }

  buildForm(controls = true) {
    const values = ObjectUtils.getControlValues<OrgExecutiveMember>(this.getValuesWithLabels());
    return {
      fullName: controls ? [values.fullName, [CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]
      ] : values.fullName,
      identificationNumber: controls ? [values.identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : values.identificationNumber,
      jobTitle: controls ? [values.jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : values.jobTitle,
    };
  }

  buildExtendedBoardMembersForm(controls = true) {

    const form = this.buildForm(controls);
    const {joinDate} = this;
    return {
      ...form,
      joinDate: controls ? [joinDate, [CustomValidators.required]] : joinDate,

    };
  }

  buildExtendedForm(controls = true) {
    const form = this.buildForm(controls);
    const {joinDate, email, phone} = this;
    return {
      ...form,
      joinDate: controls ? [joinDate, [CustomValidators.required]] : joinDate,
      email: controls
        ? [
          email,
          [
            CustomValidators.required,
            CustomValidators.pattern('EMAIL'),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EMAIL_MAX
            ),
          ],
        ]
        : email,
      phone: controls
        ? [
          phone,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.PHONE_NUMBER_MAX
            ),
          ],
        ]
        : phone,
    };
  }

  toCharityOrganizationOrgMember(): OrgExecutiveMember {
    const {
      id,
      qid,
      email,
      extraPhone,
      phone,
      jobTitle,
      joinDate,
      nationality,
      fullName,
    } = this;
    return new OrgExecutiveMember().clone({
      objectDBId: id,
      identificationNumber: qid,
      fullName,
      jobTitle,
      email,
      phone,
      joinDate: DateUtils.getDateStringFromDate(joinDate),
      nationality,
      extraPhone
    });
  }
}
