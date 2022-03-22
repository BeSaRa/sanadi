import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasLicenseApproval} from "@app/interfaces/has-license-approval";
import {DateUtils} from "@app/helpers/date-utils";
import {CustomValidators} from "@app/validators/custom-validators";
import {LicenseDurationType} from "@app/enums/license-duration-type";

type CanLicenseApproval = Constructor<HasLicenseApproval> & AbstractConstructor<HasLicenseApproval>

/** Mixin to augment a directive with a `Approval License Properties` */
export function mixinApprovalLicenseWithDuration<T extends AbstractConstructor<{}>>(base: T): CanLicenseApproval & T;
export function mixinApprovalLicenseWithDuration<T extends Constructor<{}>>(base: T): CanLicenseApproval & T {
  return class Approval extends base {
    licenseStatus!: number;
    licenseStartDate!: string;
    licenseEndDate!: string;
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
    licenseDurationType!: number;
    licenseVSID!: string
    currentVersion!: number
    currentVersionDate!: string

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
      }
    }

    private hasLicenseStartDate(): boolean {
      return !!this.licenseStartDate;
    }

    private hasLicenseEndDate(): boolean {
      return !!this.licenseEndDate;
    }

    hasValidApprovalInfo(): boolean {
      return this.licenseDurationType !== LicenseDurationType.PERMANENT ? (this.hasLicenseStartDate() && this.hasLicenseEndDate()) : this.hasLicenseStartDate()
    }

    // shallow clone
    clone<Y>(override?: Partial<Y>): Y {
      const constructor = this.constructor;
      // @ts-ignore
      return Object.assign(new constructor(), this, override);
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
