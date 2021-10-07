import {FileNetDocument} from "@app/models/file-net-document";
import {AdminResult} from '@app/models/admin-result';


export class BaseLicense extends FileNetDocument {
  licenseNumber!: string;
  licenseStatus!: number;
  organizationId!: number;
  licenseDuration!: number;
  licenseApprovedDate!: string;
  licenseStartDate!: string;
  licenseEndDate!: string;
  licenseStatusInfo!: AdminResult;
}
