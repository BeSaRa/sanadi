import { Component, Input } from '@angular/core';
import { GeneralAssociationExternalMember } from '@models/general-association-external-member';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ToastService } from '@app/services/toast.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { ManageMembersPopupComponent } from '../../popups/manage-members-popup/manage-members-popup.component';

@Component({
  selector: 'manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent extends UiCrudListGenericComponent<GeneralAssociationExternalMember>{
  @Input() isExternalUser!: boolean;
  @Input() isGeneralAssociationMembers!: boolean;
  @Input() addLabel!: keyof ILanguageKeys;
  displayColumns: string[]= ['index', 'arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];
  actions: IMenuItem<GeneralAssociationExternalMember>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GeneralAssociationExternalMember) => !this.readonly && this.edit$.next(item),
      show: (_item: GeneralAssociationExternalMember) => !this.readonly && this.isGeneralAssociationMembers && !_item.id
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GeneralAssociationExternalMember) => this.confirmDelete$.next(item),
      show: (_item: GeneralAssociationExternalMember) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GeneralAssociationExternalMember) => this.view$.next(item),
    }
  ];

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
    return{
      addLabel:this.addLabel,
      isGeneralAssociationMembers:this.isGeneralAssociationMembers
    }
  }
  
  constructor(public dialog: DialogService,
              public lang: LangService,
              public toast:ToastService,
              ) {
                super()
  }
}
