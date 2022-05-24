import { JobApplication } from "./job-application";
import { ICaseSearchCriteria } from "../interfaces/icase-search-criteria";

export class JobApplicationSearchCriteria
  extends JobApplication
  implements ICaseSearchCriteria {}
