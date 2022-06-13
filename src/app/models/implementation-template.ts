import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';

export class ImplementationTemplate extends SearchableCloneable<ImplementationTemplate> {
  templateId!: string;
  templateName!: string;
  arabicName!: string;
  englishName!: string;
  amount!: number;
  templateCost!: number;
  templateType  !: number;
  referenceNumber!: string;
  latitude!: string;
  longitude!: string;
  beneficiaryRegion!: string;
  executionRegion!: string;
  implementingAgency!: string;
  notes!: string;
  typeInfo!: AdminResult;
  implementingAgencyInfo!: AdminResult;
}
