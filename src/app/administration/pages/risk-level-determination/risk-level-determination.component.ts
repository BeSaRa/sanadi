import { Component, inject } from '@angular/core';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { RiskLevelDeterminationRequestStatusEnum } from '@app/enums/risk-level-determination-request-status-enumts';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { TabMap } from '@app/types/types';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'risk-level-determination',
  templateUrl: 'risk-level-determination.component.html',
  styleUrls: ['risk-level-determination.component.scss']
})
export class RiskLevelDeterminationComponent {
  reloadRequests$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  reloadCountries$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  onRiskLevelDeterminationCreated() {
    this.reloadRequests$.next(null);
  }
  onDecisionMade() {
    this.reloadCountries$.next(null);
  }
  lang = inject(LangService);
  employeeService = inject(EmployeeService);

  tabsData: TabMap = {
    data: {
      name: 'data',
      index: 0,
      langKey: 'lbl_data',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },

    requests: {
      name: 'requests',
      index: 1,
      langKey: 'lbl_requests',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    completed_requests: {
      name: 'completed_requests',
      index: 2,
      langKey: 'lbl_requests',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },


  }

  get canCreateRequest():boolean{
    return this.employeeService.hasAnyPermissions([PermissionsEnum.MANAGE_COUNTRIES,PermissionsEnum.RISK_LEVEL_DETERMINATION_MANAGER])
  }
  get canMakeDecision():boolean{
    return this.employeeService.hasAnyPermissions([PermissionsEnum.MANAGE_RISK_LEVEL_DETERMINATION,PermissionsEnum.RISK_LEVEL_DETERMINATION_MANAGER])
  }

  get approvalRequestStatuses(){
    const requestStatus:RiskLevelDeterminationRequestStatusEnum[] =[]
    if(this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_COUNTRIES)){
      requestStatus.push(RiskLevelDeterminationRequestStatusEnum.RETURNED)
      requestStatus.push(RiskLevelDeterminationRequestStatusEnum.REJECTED)
    }
    if(this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_RISK_LEVEL_DETERMINATION)){
      requestStatus.push(RiskLevelDeterminationRequestStatusEnum.PENDING)
    }
    return requestStatus
  }

  get completedRequestStatuses(){
    return [RiskLevelDeterminationRequestStatusEnum.APPROVED,RiskLevelDeterminationRequestStatusEnum.REJECTED]
  }
}
