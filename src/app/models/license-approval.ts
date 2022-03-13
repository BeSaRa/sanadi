import {LicenseApprovalInterface} from '@app/interfaces/license-approval-interface';
import {DateUtils} from '@app/helpers/date-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {Cloner} from '@app/models/cloner';
import {IMyDateModel} from 'angular-mydatepicker';

export abstract class LicenseApproval extends Cloner implements LicenseApprovalInterface {
  licenseStatus!: number;
  licenseStartDate!: string;
  licenseEndDate!: string | IMyDateModel;
  licenseApprovedDate!: string;
  customTerms!: string;
  publicTerms!: string;
  conditionalLicenseIndicator!: boolean;
  followUpDate!: string;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;

  buildApprovalForm(controls: boolean = false): any {
    const {
      licenseStartDate,
      licenseEndDate,
      followUpDate,
      conditionalLicenseIndicator,
      publicTerms,
      customTerms,
    } = this;
    return {
      licenseStartDate: controls ? [DateUtils.changeDateToDatepicker(licenseStartDate), CustomValidators.required] : DateUtils.changeDateToDatepicker(licenseStartDate),
      licenseEndDate: controls ? [DateUtils.changeDateToDatepicker(licenseEndDate)] : DateUtils.changeDateToDatepicker(licenseEndDate),
      followUpDate: controls ? [DateUtils.changeDateToDatepicker(followUpDate)] : DateUtils.changeDateToDatepicker(followUpDate),
      conditionalLicenseIndicator: controls ? [conditionalLicenseIndicator] : conditionalLicenseIndicator,
      publicTerms: controls ? [{value: publicTerms, disabled: true}] : publicTerms,
      customTerms: controls ? [customTerms] : customTerms
    };
  }

  abstract hasValidApprovalInfo(): boolean;
}
