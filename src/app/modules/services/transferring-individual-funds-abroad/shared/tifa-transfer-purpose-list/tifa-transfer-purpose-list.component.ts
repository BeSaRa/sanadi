import {Component, inject, Input} from '@angular/core';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {TransferFundsCharityPurpose} from "@models/transfer-funds-charity-purpose";
import {ComponentType} from "@angular/cdk/portal";
import {
  TIFAPurposePopupComponent
} from "@modules/services/transferring-individual-funds-abroad/popups/TIFB-purpose-popup/TIFA-purpose-popup.component";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {IKeyValue} from "@contracts/i-key-value";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {EmployeeService} from "@services/employee.service";
import {Country} from "@models/country";
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'tifa-transfer-purpose-list',
  templateUrl: './tifa-transfer-purpose-list.component.html',
  styleUrls: ['./tifa-transfer-purpose-list.component.scss']
})
export class TifaTransferPurposeListComponent extends UiCrudListGenericComponent<TransferFundsCharityPurpose> {
  private employeeService = inject(EmployeeService);
  @Input() isCancel: boolean = false;
  @Input() countriesList: Country[] = [];

  constructor() {
    super();
  }

  isExternalUser = this.employeeService.isExternalUser();
  displayColumns: string[] = ['projectName', 'projectType', 'domain', 'totalCost', 'beneficiaryCountry', 'executionCountry', 'actions'];
  sortingCallbacks = {
    projectType: (a: TransferFundsCharityPurpose, b: TransferFundsCharityPurpose, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.projectTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.projectTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    domain: (a: TransferFundsCharityPurpose, b: TransferFundsCharityPurpose, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.domainInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.domainInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    beneficiaryCountry: (a: TransferFundsCharityPurpose, b: TransferFundsCharityPurpose, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.beneficiaryCountryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.beneficiaryCountryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    executionCountry: (a: TransferFundsCharityPurpose, b: TransferFundsCharityPurpose, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.executionCountryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.executionCountryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }
  actions: IMenuItem<TransferFundsCharityPurpose>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: TransferFundsCharityPurpose) => {
        !this.readonly && this.edit$.next(item);
      },
      show: (_item: TransferFundsCharityPurpose) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: TransferFundsCharityPurpose) => {
        !this.readonly && this.confirmDelete$.next(item)
      },
      show: (_item: TransferFundsCharityPurpose) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TransferFundsCharityPurpose) => this.view$.next(item),
    }
  ];

  _getDeleteConfirmMessage(record: TransferFundsCharityPurpose): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.projectName});
  }

  _getDialogComponent(): ComponentType<any> {
    return TIFAPurposePopupComponent;
  }

  _getNewInstance(override: Partial<TransferFundsCharityPurpose> | undefined): TransferFundsCharityPurpose {
    return new TransferFundsCharityPurpose().clone(override ?? {});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      isCancel: this.isCancel,
      countriesList: this.countriesList
    };
  }
}
