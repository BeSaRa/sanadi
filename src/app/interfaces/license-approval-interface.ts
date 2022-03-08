export interface LicenseApprovalInterface {
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

  buildApprovalForm(controls: boolean): any

  hasValidApprovalInfo(): boolean

  clone(m?: Partial<LicenseApprovalInterface>): LicenseApprovalInterface;
}
