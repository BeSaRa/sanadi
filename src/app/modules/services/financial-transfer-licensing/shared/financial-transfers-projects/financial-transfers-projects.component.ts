import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FinancialTransfersProject } from '@models/financial-transfers-project';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogService } from '@app/services/dialog.service';
import { FinancialTransfersProjectsPopupComponent } from '../../popups/financial-transfers-projects-popup/financial-transfers-projects-popup.component';
import { ExternalProjectLicensing } from '@app/models/external-project-licensing';
import { FinancialTransferRequestTypes } from '@app/enums/service-request-types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'financial-transfers-projects',
  templateUrl: './financial-transfers-projects.component.html',
  styleUrls: ['./financial-transfers-projects.component.scss'],
})
export class FinancialTransfersProjectsComponent extends UiCrudListGenericComponent<FinancialTransfersProject> {

  displayColumns: string[] = ['fullSerial', 'qatariTransactionAmount', 'notes', 'actions'];
  @Input() approvedFinancialTransferProjects: ExternalProjectLicensing[] = [];
  @Input() requestType: number = FinancialTransferRequestTypes.NEW;
  @Input() submissionMechanism!: number;

  actions: IMenuItem<FinancialTransfersProject>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: FinancialTransfersProject) => this.edit$.next(item),
      show: (_item: FinancialTransfersProject) => !this.readonly
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

  constructor(
    public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService
  ) {
    super();
  }

  _getNewInstance(override?: Partial<FinancialTransfersProject> | undefined): FinancialTransfersProject {
    return new FinancialTransfersProject().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return FinancialTransfersProjectsPopupComponent;
  }

  _getDeleteConfirmMessage(record: FinancialTransfersProject): string {
    return this.lang.map.msg_confirm_delete_x.change({ x: record.projectName });
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      approvedFinancialTransferProjects: this.approvedFinancialTransferProjects,
      requestType: this.requestType,
      submissionMechanism: this.submissionMechanism
    };
  }

  addAllowed(): boolean {
    return !this.readonly && this.requestType == FinancialTransferRequestTypes.NEW;
  }
  @Output() listUpdated = new EventEmitter<number>();

  totalQatariRiyalTransactions = 0;
  inputMaskPatterns = CustomValidators.inputMaskPatterns


  ngOnInit(): void {
    this._calculateQatariTransactionAmount();
  }

  afterReload(): void {
    this._calculateQatariTransactionAmount();
    this.listUpdated.emit(this.totalQatariRiyalTransactions);
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
