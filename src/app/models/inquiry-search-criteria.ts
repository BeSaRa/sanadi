import {Inquiry} from './inquiry';
import {ICaseSearchCriteria} from '../interfaces/icase-search-criteria';

export class InquirySearchCriteria extends Inquiry implements ICaseSearchCriteria {
  assignDateFrom?: string;
  assignDateTo?: string;
  createdOnFrom?: string | Date;
  createdOnTo?: string | Date;
  lastModifiedFrom?: string;
  lastModifiedTo?: string;
  limit?: number;
}
