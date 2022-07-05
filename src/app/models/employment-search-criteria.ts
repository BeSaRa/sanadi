import { Employment } from "./employment";

export class EmploymentSearchCriteria
  extends Employment {
  identificationNumber: string = '';
  passportNumber: string = '';
  isManager: boolean = false;
}
