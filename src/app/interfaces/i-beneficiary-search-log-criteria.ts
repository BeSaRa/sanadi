export interface IBeneficiarySearchLogCriteria {
  limit: number;
  benIdNationality: number;
  benIdType: number;
  benIsPrimaryId: boolean;
  benIdNumber: string;
  fromActionTime: string;
  toActionTime: string;
  orgId: number;
  orgUserId: number;
}
