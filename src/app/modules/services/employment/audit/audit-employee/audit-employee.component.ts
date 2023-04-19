import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { Employee } from '@app/models/employee';
import { Lookup } from '@app/models/lookup';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ControlValueLabelLangKey } from '@app/types/types';

@Component({
    selector: 'audit-employee',
    templateUrl: 'audit-employee.component.html',
    styleUrls: ['audit-employee.component.scss']
})
export class AuditEmployeeComponent extends AuditListGenericComponent<Employee> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService,
              private lookupService:LookupService) {
    super();
  }
  Gender: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  displayColumns: string[] =  ['arabicName', 'englishName', 'jobTitleInfo', 'gender','actions'];
  actions: IMenuItem<Employee>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Employee> | undefined): Employee {
    if (CommonUtils.isValidValue(override)) {
      return new Employee().clone(override)
    }
    return new Employee();
  }

  getControlLabels(item: Employee): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  getGenderName(gender: number) {
    return this.Gender.find((g) => g.lookupKey == gender)?.getName();
  }

}
