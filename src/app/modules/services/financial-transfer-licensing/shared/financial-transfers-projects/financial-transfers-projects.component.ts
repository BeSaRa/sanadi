import { ComponentType } from '@angular/cdk/portal';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { FinancialTransferRequestTypes } from '@app/enums/service-request-types';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ExternalProjectLicensing } from '@app/models/external-project-licensing';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { FinancialTransfersProject } from '@models/financial-transfers-project';
import {
  FinancialTransfersProjectsPopupComponent
} from '../../popups/financial-transfers-projects-popup/financial-transfers-projects-popup.component';

@Component({
  selector: 'financial-transfers-projects',
  templateUrl: './financial-transfers-projects.component.html',
  styleUrls: ['./financial-transfers-projects.component.scss'],
})
export class FinancialTransfersProjectsComponent extends UiCrudListGenericComponent<FinancialTransfersProject> {
  @Input() requestType: number = FinancialTransferRequestTypes.NEW;
  @Input() submissionMechanism!: number;
  @Input() caseId!: number;
  @Input() country!: number;
  @Input() modelQatariTransactionAmount!: number;
  @Output() listUpdated = new EventEmitter<number>();
  @Output() financialTransfersProjectListUpdated= new EventEmitter<FinancialTransfersProject[]>();
  constructor( ) {
    super();
  }

  displayColumns: string[] = ['fullSerial', 'qatariTransactionAmount', 'notes', 'actions'];
  actions: IMenuItem<FinancialTransfersProject>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: FinancialTransfersProject) => this.edit$.next(item),
      show: (_item: FinancialTransfersProject) => !this.readonly ,
      disabled : ()=> !this.country
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: FinancialTransfersProject) => this.confirmDelete$.next(item),
      show: (_item: FinancialTransfersProject) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: FinancialTransfersProject) => this.view$.next(item),
    }
  ];
  totalQatariRiyalTransactions = 0;

  _getNewInstance(override?: Partial<FinancialTransfersProject> | undefined): FinancialTransfersProject {
    return new FinancialTransfersProject().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return FinancialTransfersProjectsPopupComponent;
  }

  _getDeleteConfirmMessage(record: FinancialTransfersProject): string {
    return this.lang.map.msg_confirm_delete_x.change({ x: record.fullSerial });
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      requestType: this.requestType,
      submissionMechanism: this.submissionMechanism,
      caseId:this.caseId,
      country :this.country,
      modelQatariTransactionAmount :this.modelQatariTransactionAmount
    };
  }

 
  addAllowed(): boolean {
    
    return !this.readonly && this.requestType == FinancialTransferRequestTypes.NEW && !!this.country;
  }

  _init(): void {
    this._calculateQatariTransactionAmount();
  }

  afterReload(): void {
    this._calculateQatariTransactionAmount();
    this.listUpdated.emit(this.totalQatariRiyalTransactions);
   this.financialTransfersProjectListUpdated.emit([...this.list]);
  }

  private _calculateQatariTransactionAmount() {
    this.totalQatariRiyalTransactions = this.list
      .map((record) => Number(record.qatariTransactionAmount))
      .reduce((prev, current) => prev + current, 0);
  }

  isTransferAmountGreaterThenDueAmount(record: FinancialTransfersProject): boolean {
    return record.transferAmount > record.dueAmount
  }

}
