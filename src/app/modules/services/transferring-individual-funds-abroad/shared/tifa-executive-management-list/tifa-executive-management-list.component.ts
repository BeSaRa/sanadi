import {Component, inject, Input} from '@angular/core';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {TransferFundsExecutiveManagement} from "@models/transfer-funds-executive-management";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ComponentType} from "@angular/cdk/portal";
import {EmployeeService} from "@services/employee.service";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {IKeyValue} from "@contracts/i-key-value";
import {
  TIFAExecutiveManagementPopupComponent
} from "@modules/services/transferring-individual-funds-abroad/popups/TIFA-executive-management-popup/TIFA-executive-management-popup.component";
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'tifa-executive-management-list',
  templateUrl: './tifa-executive-management-list.component.html',
  styleUrls: ['./tifa-executive-management-list.component.scss']
})
export class TifaExecutiveManagementListComponent extends UiCrudListGenericComponent<TransferFundsExecutiveManagement> {
  private employeeService = inject(EmployeeService);
  @Input() isCancel: boolean = false;

  constructor() {
    super();
  }

  isExternalUser = this.employeeService.isExternalUser();

  displayColumns: string[] = ['localName', 'englishName', 'jobTitle', 'nationality', 'executiveIdentificationNumber', 'actions'];
  sortingCallbacks = {
    localName: (a: TransferFundsExecutiveManagement, b: TransferFundsExecutiveManagement, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.nameLikePassport.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.nameLikePassport.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    englishName: (a: TransferFundsExecutiveManagement, b: TransferFundsExecutiveManagement, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.englishNameLikePassport.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.englishNameLikePassport.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    nationality: (a: TransferFundsExecutiveManagement, b: TransferFundsExecutiveManagement, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.executiveNationalityInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.executiveNationalityInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }
  actions: IMenuItem<TransferFundsExecutiveManagement>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: TransferFundsExecutiveManagement) => {
        !this.readonly && this.edit$.next(item);
      },
      show: (_item: TransferFundsExecutiveManagement) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: TransferFundsExecutiveManagement) => {
        !this.readonly && this.confirmDelete$.next(item)
      },
      show: (_item: TransferFundsExecutiveManagement) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TransferFundsExecutiveManagement) => this.view$.next(item),
    }
  ];

  _getDeleteConfirmMessage(record: TransferFundsExecutiveManagement): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.getName()});
  }

  _getDialogComponent(): ComponentType<any> {
    return TIFAExecutiveManagementPopupComponent;
  }

  _getNewInstance(override: Partial<TransferFundsExecutiveManagement> | undefined): TransferFundsExecutiveManagement {
    return new TransferFundsExecutiveManagement().clone(override ?? {});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      isCancel: this.isCancel
    };
  }
}
