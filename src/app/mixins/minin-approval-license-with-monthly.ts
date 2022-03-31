import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasLicenseApprovalMonthly} from "@app/interfaces/has-license-approval-monthly";
import {DateUtils} from "@app/helpers/date-utils";
import {CustomValidators} from "@app/validators/custom-validators";

type CanLicenseApproval = Constructor<HasLicenseApprovalMonthly> & AbstractConstructor<HasLicenseApprovalMonthly>

export function mixinApprovalLicenseWithMonthly<T extends AbstractConstructor<{}>>(base: T): CanLicenseApproval & T;
export function mixinApprovalLicenseWithMonthly<T extends Constructor<{}>>(base: T): CanLicenseApproval & T {
  return class Approval extends base implements HasLicenseApprovalMonthly {
    licenseNumber!: string;
    licenseStatus!: number;
    licenseStartDate!: string;
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
    licenseVSID!: string;
    currentVersion!: number;
    currentVersionDate!: string;
    licenseDuration!: number;
    deductionPercent!: number;

    buildApprovalForm(controls: boolean = false): any {
      const {
        licenseStartDate,
        licenseDuration,
        followUpDate,
        conditionalLicenseIndicator,
        publicTerms,
        customTerms,
      } = this;
      return {
        licenseStartDate: controls ? [DateUtils.changeDateToDatepicker(licenseStartDate), CustomValidators.required] : DateUtils.changeDateToDatepicker(licenseStartDate),
        licenseDuration: controls ? [licenseDuration, [CustomValidators.required]] : licenseDuration,
        followUpDate: controls ? [DateUtils.changeDateToDatepicker(followUpDate)] : DateUtils.changeDateToDatepicker(followUpDate),
        conditionalLicenseIndicator: controls ? [conditionalLicenseIndicator] : conditionalLicenseIndicator,
        publicTerms: controls ? [{value: publicTerms, disabled: true}] : publicTerms,
        customTerms: controls ? [customTerms] : customTerms
      }
    }

    private hasLicenseStartDate(): boolean {
      return !!this.licenseStartDate;
    }

    hasValidLicenseDuration(): boolean {
      return !!this.licenseDuration
    }

    hasValidApprovalInfo(): boolean {
      return this.hasLicenseStartDate() && this.hasValidLicenseDuration()
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

  }
}
