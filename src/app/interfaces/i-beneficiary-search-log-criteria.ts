export interface IBeneficiarySearchLogCriteria {
  limit: number;
  benIdNationality: number;
  benIdType: number;
  benIsPrimaryId: boolean;
  benIdNumber: string;
  fromActionTime: string;
  toActionTime: string;
  orgBranchId: number;
  orgId: number;
  orgUserId: number;
}
