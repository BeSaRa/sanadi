import { ContactOfficer } from '@app/models/contact-officer';
import { BankAccount } from './bank-account';
import { ExecutiveManagement } from './executive-management';
import { AdminResult } from './admin-result';
import { BaseLicense } from './base-license';
import { InterceptModel } from "@decorators/intercept-model";
import {
  ExternalOrgAffiliationResultInterceptor
} from "@app/model-interceptors/external-org-affiliation-result-interceptor";

const { send, receive } = new ExternalOrgAffiliationResultInterceptor();
@InterceptModel({ send, receive })
export class ExternalOrgAffiliationResult extends BaseLicense {
  arName!: string;
  bankAccountDTOs: BankAccount[] = [];
  category!: number;
  categoryInfo!: AdminResult;
  city!: string;
  classDescription!: string;
  contactOfficerDTOs: ContactOfficer[] = [];
  lastModified!: string;
  country!: number;
  countryInfo!: AdminResult;
  creatorInfo!: AdminResult;
  documentTitle!: string;
  email!: string;
  enName!: string;
  executiveManagementDTOs: ExecutiveManagement[] = [];
  fax!: string;
  fullSerial!: string;
  id!: string;
  licenseStatus!: number;
  licenseStatusInfo!: AdminResult;
  licenseType!: number;
  mailBox!: string;
  mimeType!: string;
  organizationId!: number;
  ouInfo!: AdminResult;
  phone!: string;
  requestType!: number;
  requestTypeInfo!: AdminResult;
  serial!: number;
  website!: string;
}
