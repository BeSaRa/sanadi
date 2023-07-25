import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IFindInList } from '@app/interfaces/i-find-in-list';
import { Bylaw } from '@app/models/bylaw';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-bylaws',
    templateUrl: 'audit-bylaws.component.html',
    styleUrls: ['audit-bylaws.component.scss']
})
export class AuditBylawsComponent extends AuditListGenericComponent<Bylaw> {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = [
    'fullName',
    'category',
    'firstReleaseDate',
    'lastUpdateDate',
    'actions'
    ];
  actions: IMenuItem<Bylaw>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<Bylaw> | undefined): Bylaw {
    if (CommonUtils.isValidValue(override)) {
      return new Bylaw().clone(override)
    }
    return new Bylaw();
  }

  getControlLabels(item: Bylaw): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }

  existsInList(objComparison: IFindInList<Bylaw>): Bylaw | undefined {
    return objComparison.listToCompareWith.find((item) => item.objectDBId === objComparison.itemToCompare.objectDBId);
  }
}

