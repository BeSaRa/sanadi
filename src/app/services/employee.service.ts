import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {OrgUser} from '../models/org-user';
import {OrgBranch} from '../models/org-branch';
import {OrgUnit} from '../models/org-unit';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private orgBranch?: OrgBranch;
  private orgUnit?: OrgUnit;
  private orgUser?: OrgUser;

  constructor() {
    FactoryService.registerService('EmployeeService', this);
  }


  setCurrentEmployeeData(orgUser: any, orgBranch: any, orgUnit: any): void {
    this.orgUser = (new OrgUser()).clone(orgUser);
    this.orgBranch = (new OrgBranch()).clone(orgBranch);
    this.orgUnit = (new OrgUnit()).clone(orgUnit);
  }

  clear(): void {
    this.orgBranch = undefined;
    this.orgUnit = undefined;
    this.orgUser = undefined;
  }

  getUser(): OrgUser | undefined {
    return this.orgUser;
  }

  getBranch(): OrgBranch | undefined {
    return this.orgBranch;
  }

  getOrgUnit(): OrgUnit | undefined {
    return this.orgUnit;
  }


}
