import {HasLicenseDurationMonthly} from "@app/interfaces/has-license-duration-monthly";

export interface HasLicenseApprovalMonthly extends HasLicenseDurationMonthly {
  licenseNumber: string;
  licenseStatus: number;
  licenseStartDate: string;
  licenseApprovedDate: string;
  customTerms: string;
  publicTerms: string;
  conditionalLicenseIndicator: boolean;
  followUpDate: string;
  oldLicenseFullSerial: string;
  oldLicenseId: string;
  oldLicenseSerial: number;
  exportedLicenseFullSerial: string;
  exportedLicenseId: string;
  exportedLicenseSerial: number;
  licenseVSID: string
  currentVersion: number
  currentVersionDate: string
  deductionPercent: number;

  buildApprovalForm(controls: boolean): any

  hasValidApprovalInfo(): boolean

  clone<T>(m?: Partial<T>): T;
}
