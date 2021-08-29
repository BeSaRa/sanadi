import {FileNetDocument} from "@app/models/file-net-document";


export class BaseLicense extends FileNetDocument {
  licenseNumber!: string;
  licenseStatus!: number;
  organizationId!: number;
  licenseDuration!: number;
  licenseApprovedDate!: string;
  licenseStartDate!: string;
  licenseEndDate!: string;
}
