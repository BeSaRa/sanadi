import {Component, Input} from '@angular/core';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {ExecutiveManagement} from '@models/executive-management';
import {LangService} from '@services/lang.service';
import {CaseAuditService} from '@services/case-audit.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {ControlValueLabelLangKey} from '@app/types/types';

@Component({
  selector: 'audit-executive-management',
  templateUrl: './audit-executive-management.component.html',
  styleUrls: ['./audit-executive-management.component.scss']
})
export class AuditExecutiveManagementComponent extends AuditListGenericComponent<ExecutiveManagement> {
  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  @Input() hidePassport: boolean = false;
  @Input() hideQId: boolean = true;

  private columns = ['identificationNumber', 'arabicName', 'englishName','jobTitle', 'email', 'phone','nationality', 'actions'];

  get displayColumns(): string[] {
    if (this.hidePassport) {
      return this.columns.filter(x => x !== 'passportNumber');
    }
    if (this.hideQId) {
      return this.columns.filter(x => x !== 'identificationNumber');
    }
    return this.columns;
  }

  actions: IMenuItem<ExecutiveManagement>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<ExecutiveManagement> | undefined): ExecutiveManagement {
    if (CommonUtils.isValidValue(override)) {
      return new ExecutiveManagement().clone(override)
    }
    return new ExecutiveManagement();
  }

  getControlLabels(item: ExecutiveManagement): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels(this.hidePassport, this.hideQId);
  }
}
