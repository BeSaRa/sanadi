import {Component, inject, Input} from '@angular/core';
import {GeneralAssociationExternalMember} from '@models/general-association-external-member';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {EmployeeService} from "@services/employee.service";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {ComponentType} from "@angular/cdk/portal";
import {IKeyValue} from "@contracts/i-key-value";
import {
  ManageMembersPopupComponent
} from "@modules/services/general-association-meeting-attendance/popups/manage-members-popup/manage-members-popup.component";
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent extends UiCrudListGenericComponent<GeneralAssociationExternalMember> {
  private employeeService = inject(EmployeeService);
  @Input() isGeneralAssociationMembers!: boolean;
  @Input() addLabel!: keyof ILanguageKeys;

  constructor() {
    super();
  }

  isExternalUser = this.employeeService.isExternalUser();
  displayColumns: string[] = ['index', 'arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];
  sortingCallbacks = {
    jobTitle: (a: GeneralAssociationExternalMember, b: GeneralAssociationExternalMember, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.jobTitleInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.jobTitleInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }
  actions: IMenuItem<GeneralAssociationExternalMember>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GeneralAssociationExternalMember) => !this.readonly && this.edit$.next(item),
      show: (item: GeneralAssociationExternalMember) => !this.readonly && this.isGeneralAssociationMembers && !item.id
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GeneralAssociationExternalMember) => this.confirmDelete$.next(item),
      show: (item: GeneralAssociationExternalMember) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GeneralAssociationExternalMember) => this.view$.next(item),
    }
  ];

  protected _afterViewInit() {
    if (!this.isGeneralAssociationMembers) {
      this.displayColumns = this.displayColumns.filter(x => x !== 'jobTitle');
    }
  }

  _getNewInstance(override?: Partial<GeneralAssociationExternalMember> | undefined): GeneralAssociationExternalMember {
    return new GeneralAssociationExternalMember().clone(override ?? {});
  };

  _getDialogComponent(): ComponentType<any> {
    return ManageMembersPopupComponent;
  };

  _getDeleteConfirmMessage(record: GeneralAssociationExternalMember): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.getName()});
  };

  getExtraDataForPopup(): IKeyValue {
    return {
      addLabel: this.addLabel,
      isGeneralAssociationMembers: this.isGeneralAssociationMembers
    }
  }
}
