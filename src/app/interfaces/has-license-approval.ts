export interface HasLicenseApproval {
  licenseStatus: number;
  licenseStartDate: string;
  licenseEndDate: string;
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
  licenseDurationType: number;
  licenseVSID: string
  currentVersion: number
  currentVersionDate: string

  buildApprovalForm(controls: boolean): any

  hasValidApprovalInfo(): boolean

  clone<T>(m?: Partial<T>): T;
}
