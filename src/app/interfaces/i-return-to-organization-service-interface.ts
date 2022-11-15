import {ValidOrgUnit} from '@app/models/valid-org-unit';
import {Observable} from 'rxjs';
import {Profile} from '@app/models/profile';

export interface IReturnToOrganizationService{
  returnToOrganization(caseId: number, orgId: number): Observable<Profile[]> ;
  getToReturnValidOrganizations(caseId: number): Observable<ValidOrgUnit[]> ;
}
