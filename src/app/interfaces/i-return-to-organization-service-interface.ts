import { OrgUnit } from "@app/models/org-unit"
import { ValidOrgUnit } from "@app/models/valid-org-unit"
import { Observable } from "rxjs"

export interface IReturnToOrganizationService{
  returnToOrganization(caseId: number, orgId: number): Observable<OrgUnit[]> ;
  getToReturnValidOrganizations(caseId: number): Observable<ValidOrgUnit[]> ;
}
