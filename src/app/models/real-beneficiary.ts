import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

export class RealBeneficiary extends SearchableCloneable<RealBeneficiary> {
  updatedBy!: number;
  clientData!: string;
  orgType!: number;
  orgId!: number;
  arName!: string;
  enName!: string;
  birthDate!: string;
  birthLocation!: string;
  nationality!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  qid!: string;
  passportNumber!: string;
  iDDate!: string;
  passportDate!: string;
  iDExpiryDate!: string;
  passportExpiryDate!: string;
  startDate!: string;
  lastUpdateDate!: string;
  id!: number;
  iddate!: string;
  idexpiryDate!: string;
  nationalityInfo!: AdminResult;

}
