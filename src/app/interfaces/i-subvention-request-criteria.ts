import {IBeneficiaryCriteria} from './i-beneficiary-criteria';

export interface ISubventionRequestCriteria {
  limit: number;
  offset: number;
  creationDateFrom: string;
  creationDateTo: string;
  statusDateModifiedFrom: string
  statusDateModifiedTo: string;
  beneficiary: Partial<IBeneficiaryCriteria>
  requestType: number;
  requestSerial: string;
  requestFullSerial: string;
  status: number;
  orgBranchId: number;
  orgUserId: number;
  orgId: number;
  aidLookupId: number;
}
