import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { LessonsLearned } from '@app/models/lessons-learned';
import { IFindInList } from '@app/interfaces/i-find-in-list';

@Component({
  selector: 'audit-lessons-learnt-list',
  templateUrl: './audit-lessons-learnt-list.component.html',
  styleUrls: ['./audit-lessons-learnt-list.component.scss']
})
export class AuditLessonsLearntListComponent extends AuditListGenericComponent<LessonsLearned> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }

  @Input()
  displayColumns: string[] = ['lessonsLearntListString', 'statement', 'actions'];
  actions: IMenuItem<LessonsLearned>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<LessonsLearned> | undefined): LessonsLearned {
    if (CommonUtils.isValidValue(override)) {
      return new LessonsLearned().clone(override)
    }
    return new LessonsLearned();
  }

  getControlLabels(item: LessonsLearned): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<LessonsLearned>): LessonsLearned | undefined {
    return objComparison.listToCompareWith.find((item: LessonsLearned) => {
      return item.statement === objComparison.itemToCompare.statement && CommonUtils.isEqualList(item.lessonsLearned, objComparison.itemToCompare.lessonsLearned)
    });
  }

}
