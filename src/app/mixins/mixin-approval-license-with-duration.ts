import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasLicenseApproval} from "@app/interfaces/has-license-approval";
import {DateUtils} from "@app/helpers/date-utils";
import {LicenseDurationType} from "@app/enums/license-duration-type";
import { ControlValueLabelLangKey } from "@app/types/types";
import { ObjectUtils } from "@app/helpers/object-utils";

type CanLicenseApproval = Constructor<HasLicenseApproval> & AbstractConstructor<HasLicenseApproval>

/** Mixin to augment a directive with a `Approval License Properties` */
export function mixinApprovalLicenseWithDuration<T extends AbstractConstructor<{}>>(base: T): CanLicenseApproval & T;
export function mixinApprovalLicenseWithDuration<T extends Constructor<{}>>(base: T): CanLicenseApproval & T {
  return class Approval extends base implements HasLicenseApproval {
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
    itemId!: string

    getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
      return {
        licenseStartDate:{langKey: 'license_start_date', value: this.licenseStartDate},
        licenseEndDate:{langKey: 'license_end_date', value: this.licenseEndDate},
        followUpDate:{langKey: 'follow_up_date', value: this.followUpDate},
        conditionalLicenseIndicator:{langKey: 'conditional_license_indicator', value: this.conditionalLicenseIndicator},
        publicTerms:{langKey: 'public_terms', value: this.publicTerms},
        customTerms:{langKey: 'custom_terms', value: this.customTerms},
      };
    }
    buildApprovalForm(controls: boolean = false): any {
      const values = ObjectUtils.getControlValues<Approval>(this.getValuesWithLabels());
      return {
        licenseStartDate: controls ? [DateUtils.changeDateToDatepicker(values.licenseStartDate)] : DateUtils.changeDateToDatepicker(values.licenseStartDate),
        licenseEndDate: controls ? [DateUtils.changeDateToDatepicker(values.licenseEndDate)] : DateUtils.changeDateToDatepicker(values.licenseEndDate),
        followUpDate: controls ? [DateUtils.changeDateToDatepicker(values.followUpDate)] : DateUtils.changeDateToDatepicker(values.followUpDate),
        conditionalLicenseIndicator: controls ? [values.conditionalLicenseIndicator] : values.conditionalLicenseIndicator,
        publicTerms: controls ? [{value: values.publicTerms, disabled: true}] : values.publicTerms,
        customTerms: controls ? [values.customTerms] : values.customTerms
      }
    }

    // private hasLicenseStartDate(): boolean {
    //   return !!this.licenseStartDate;
    // }

    private hasLicenseEndDate(): boolean {
      return !!this.licenseEndDate;
    }

    hasValidApprovalInfo(): boolean {
      return this.licenseDurationType !== LicenseDurationType.PERMANENT ? (this.hasLicenseEndDate()) : true
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
