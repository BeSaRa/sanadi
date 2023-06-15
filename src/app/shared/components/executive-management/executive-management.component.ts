import {Component, Input} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {ExecutiveManagement} from '@app/models/executive-management';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  ExecutiveManagementPopupComponent
} from '../../popups/executive-management-popup/executive-management-popup.component';
import {UiCrudListGenericComponent} from '@app/generics/ui-crud-list-generic-component';
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'executive-management',
  templateUrl: './executive-management.component.html',
  styleUrls: ['./executive-management.component.scss']
})
export class ExecutiveManagementComponent extends UiCrudListGenericComponent<ExecutiveManagement> {

  @Input() hidePassport: boolean = false;
  @Input() hideQId: boolean = true;
  @Input() pageTitleKey: keyof ILanguageKeys = 'managers';

  constructor() {
    super();
  }

  displayColumns: string[] = ['identificationNumber', 'arabicName', 'englishName', 'email', 'passportNumber', 'actions'];
  actions: IMenuItem<ExecutiveManagement>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ExecutiveManagement) => this.edit$.next(item),
      show: (_item: ExecutiveManagement) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ExecutiveManagement) => this.confirmDelete$.next(item),
      show: (_item: ExecutiveManagement) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ExecutiveManagement) => this.view$.next(item),
    }
  ];

  protected _afterViewInit() {
    if (this.hidePassport) {
      this.displayColumns = this.displayColumns.filter(x => x !== 'passportNumber');
    }
    if (this.hideQId) {
      this.displayColumns = this.displayColumns.filter(x => x !== 'identificationNumber');
    }
  }

  _getNewInstance(override?: Partial<ExecutiveManagement> | undefined): ExecutiveManagement {
    return new ExecutiveManagement().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ExecutiveManagementPopupComponent
  }

  _getDeleteConfirmMessage(record: ExecutiveManagement): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.getName()});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      pageTitle: this.pageTitleKey,
      hidePassport: this.hidePassport,
      hideQId: this.hideQId
    };
  }
}
