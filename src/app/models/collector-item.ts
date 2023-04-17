import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {mixinApprovalLicenseWithDuration} from '@app/mixins/mixin-approval-license-with-duration';
import {HasLicenseApproval} from '@app/interfaces/has-license-approval';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';
import { ObjectUtils } from '@app/helpers/object-utils';

const _LicenseApproval = mixinApprovalLicenseWithDuration(class {
})

export class CollectorItem extends _LicenseApproval implements HasLicenseApproval,IAuditModelProperties<CollectorItem> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  id!: string;
  arabicName!: string;
  collectorNumber!: string;
  collectorType!: number;
  gender!: number;
  identificationNumber!: string;
  itemId!: string;
  jobTitle!: string;
  mobileNo!: string;
  nationality!: number;
  phone!: string;
  relationship!: number;
  licenseStatusInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;
  relationshipInfo!: AdminResult;
  collectorTypeInfo!: AdminResult;
  genderInfo!: AdminResult;
  nationalityInfo!: AdminResult;

  constructor() {
    super();
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      collectorType:{langKey: 'collector_type', value: this.collectorType},
      arabicName:{langKey: 'arabic_name', value: this.arabicName},
      collectorNumber:{langKey: 'collector_number', value: this.collectorNumber},
      gender:{langKey: 'gender', value: this.gender},
      identificationNumber:{langKey: 'identification_number', value: this.identificationNumber},
      nationality:{langKey: 'lbl_nationality', value: this.nationality},
      relationship:{langKey: 'relationship', value: this.relationship},
      jobTitle:{langKey: 'job_title', value: this.jobTitle},
      phone:{langKey: 'lbl_phone', value: this.phone},
      licenseEndDate:{langKey: 'license_end_date', value: this.licenseEndDate},
      oldLicenseFullSerial:{langKey: 'serial_number', value: this.oldLicenseFullSerial}
    };
  }
  buildForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<CollectorItem>(this.getValuesWithLabels());

    return {
      collectorType: controls ? [ values.collectorType, [CustomValidators.required]] : values.collectorType,
      arabicName: controls ? [ values.arabicName, [CustomValidators.required, CustomValidators.pattern('AR_NUM_ONE_AR'), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]] : values.arabicName,
      collectorNumber: controls ? [ values.collectorNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.collectorNumber,
      gender: controls ? [ values.gender, [CustomValidators.required]] : values.gender,
      identificationNumber: controls ? [ values.identificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.identificationNumber,
      nationality: controls ? [ values.nationality, [CustomValidators.required]] : values.nationality,
      relationship: controls ? [ values.relationship] : values.relationship,
      jobTitle: controls ? [ values.jobTitle, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.jobTitle,
      phone: controls ? [ values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      licenseEndDate: controls ? [ values.licenseEndDate, [CustomValidators.required]] : values.licenseEndDate,
      oldLicenseFullSerial: controls ? [ values.oldLicenseFullSerial] : values.oldLicenseFullSerial,
    }
  }
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof CollectorItem): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'gender':
        adminResultValue = this.genderInfo;
        break;
      case 'collectorType':
        adminResultValue = this.collectorTypeInfo;
        break;
      case 'relationship':
        adminResultValue = this.relationshipInfo;
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
}
