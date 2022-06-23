import { JobApplication } from "./job-application";

export class JobApplicationSearchCriteria
  extends JobApplication {
  identificationNumber: string = '';
  passportNumber: string = '';
  isManager: boolean = false;
}
