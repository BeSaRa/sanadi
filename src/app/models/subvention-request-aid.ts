import {AdminResult} from './admin-result';
import {SubventionApprovedAid} from './subvention-approved-aid';

export class SubventionRequestAid {
  requestId!: number;
  aidAmount!: number;
  requestedAidAmount!: number;
  charityRefNo!: string;
  creationDate!: string;
  requestFullSerial!: string;
  aids!: SubventionApprovedAid[];
  aidLookupInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  statusInfo!: AdminResult;
}
