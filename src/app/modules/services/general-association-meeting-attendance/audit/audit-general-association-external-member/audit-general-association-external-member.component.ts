import {Component, Input} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {AuditListGenericComponent} from '@app/generics/audit-list-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IFindInList} from '@app/interfaces/i-find-in-list';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseAuditService} from '@app/services/case-audit.service';
import {LangService} from '@app/services/lang.service';
import {ControlValueLabelLangKey} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'audit-general-association-external-member',
  templateUrl: 'audit-general-association-external-member.component.html',
  styleUrls: ['audit-general-association-external-member.component.scss']
})
export class AuditGeneralAssociationExternalMemberComponent extends AuditListGenericComponent<GeneralAssociationExternalMember> {
  @Input() isGeneralAssociationMembers: boolean = false;

  constructor(public lang: LangService,
              public caseAuditService: CaseAuditService) {
    super();
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] = ['arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];
  actions: IMenuItem<GeneralAssociationExternalMember>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _afterViewInit(): void {
    if (!this.isGeneralAssociationMembers) {
      this.displayColumns = this.displayColumns.filter(x => x !== 'jobTitle');
    }
  }

  _getNewInstance(override: Partial<GeneralAssociationExternalMember> | undefined): GeneralAssociationExternalMember {
    if (CommonUtils.isValidValue(override)) {
      return new GeneralAssociationExternalMember().clone(override)
    }
    return new GeneralAssociationExternalMember();
  }

  getControlLabels(item: GeneralAssociationExternalMember): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels(this.isGeneralAssociationMembers);
  }

  existsInList(objComparison: IFindInList<GeneralAssociationExternalMember>): GeneralAssociationExternalMember | undefined {
    return objComparison.listToCompareWith.find((item) => item.id === objComparison.itemToCompare.id);
  }
}
