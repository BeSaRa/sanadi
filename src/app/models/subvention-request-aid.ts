import {AdminResult} from './admin-result';

export class SubventionRequestAid {
  requestId!: number;
  aidAmount!: number;
  requestedAidAmount!: number;
  charityRefNo!: string;
  creationDate!: string;
  requestFullSerial!: string;
  aidLookupInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  statusInfo!: AdminResult;
}
