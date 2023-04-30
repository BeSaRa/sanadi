import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { Result } from '@app/models/result';

@Component({
  selector: 'audit-result-list',
  templateUrl: './audit-result-list.component.html',
  styleUrls: ['./audit-result-list.component.scss']
})
export class AuditResultListComponent extends AuditListGenericComponent<Result> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['outputs', 'expectedResults', 'expectedImpact', 'actions'];
  actions: IMenuItem<Result>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Result> | undefined): Result {
    if (CommonUtils.isValidValue(override)) {
      return new Result().clone(override)
    }
    return new Result();
  }

  getControlLabels(item: Result): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
