import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FinancialTransferRequestTypes} from '@app/enums/service-request-types';
import {SubmissionMechanisms} from '@app/enums/submission-mechanisms.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ExternalProjectLicensing} from '@app/models/external-project-licensing';
import {FinancialTransfersProject} from '@app/models/financial-transfers-project';
import {FinancialTransferLicensingService} from '@app/services/financial-transfer-licensing.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'financial-transfers-projects-popup',
  templateUrl: './financial-transfers-projects-popup.component.html',
  styleUrls: ['./financial-transfers-projects-popup.component.scss']
})
export class FinancialTransfersProjectsPopupComponent extends UiCrudDialogGenericComponent<FinancialTransfersProject> {
  popupTitleKey: keyof ILanguageKeys;
  selectedProject: FinancialTransfersProject;
  approvedFinancialTransferProjects: ExternalProjectLicensing[] = [];
  requestType: number;
  submissionMechanism: number;
  financialTransferProjectControl!: UntypedFormControl;
  lastQatariTransactionAmountValue: any;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<FinancialTransfersProject>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private financialTransferLicensingService: FinancialTransferLicensingService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'lbl_projects';
    this.selectedProject = data.extras?.selectedProject
    this.requestType = data.extras?.requestType
    this.submissionMechanism = data.extras?.submissionMechanism
    this.approvedFinancialTransferProjects = data.extras?.approvedFinancialTransferProjects;
  }

  _getNewInstance(override?: Partial<FinancialTransfersProject> | undefined): FinancialTransfersProject {
    return new FinancialTransfersProject().clone(override ?? {});
  }

  initPopup(): void {
    this._listenToFinancialTransferProjectChange();
    this._listenQatariTransactionAmountChange()
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: FinancialTransfersProject, originalModel: FinancialTransfersProject): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: FinancialTransfersProject, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isQatariTransactionAmountValid = this.submissionMechanism === SubmissionMechanisms.NOTIFICATION || (this.qatariTransactionAmount.value <= this.selectedProject!.dueAmount)
    if (!isQatariTransactionAmountValid) {
      this.toast.error(this.lang.map.msg_qatari_transaction_should_not_exceed_due_amount);
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: FinancialTransfersProject, form: UntypedFormGroup): FinancialTransfersProject | Observable<FinancialTransfersProject> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      dueAmount: this.selectedProject!.dueAmount,
      transferAmount: this.selectedProject!.transferAmount,
      projectTotalCost: this.selectedProject!.projectTotalCost,
      remainingAmount: this.selectedProject!.remainingAmount,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getFormFields(true));
    const approvedProject = this.approvedFinancialTransferProjects.find(x => x.fullSerial === this.model.fullSerial);
    this.financialTransferProjectControl = this.fb.control([]);
    this.financialTransferProjectControl.patchValue(approvedProject?.id, {emitEvent: false, onlySelf: true});
  }

  private _listenQatariTransactionAmountChange() {
    this.qatariTransactionAmount.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(_ => this.requestType === FinancialTransferRequestTypes.UPDATE),
        filter(_ => !!this.financialTransferProjectControl.value),
        filter(value => !!value),
        filter(value => this.lastQatariTransactionAmountValue !== value),
        debounceTime(500),
        switchMap(transactionAmount => {
          this.lastQatariTransactionAmountValue = transactionAmount;
          return this.financialTransferLicensingService
            .loadEternalProjectsDetails(this.financialTransferProjectControl.value, transactionAmount)
            .pipe(
              catchError(_ => of(null)),
            )
        })
      )
  }

  private _listenToFinancialTransferProjectChange() {
    this.financialTransferProjectControl.valueChanges
      .pipe(
        filter(value => !!value),
        switchMap((value: string) => {

          const qatariTransactionAmount = this.requestType === FinancialTransferRequestTypes.UPDATE ?
            this.qatariTransactionAmount.value : undefined;
          return this.financialTransferLicensingService.loadEternalProjectsDetails(value, qatariTransactionAmount)
            .pipe(
              catchError(_ => of(null)),
            )
        }),

        takeUntil(this.destroy$)
      )
      .subscribe((project: FinancialTransfersProject | null) => {
        if (!project) {
          this.financialTransferProjectControl.reset();
          return;
        }

        this.form.patchValue({...project, qatariTransactionAmount: this.qatariTransactionAmount.value});
        this.selectedProject = project
      });
  }

  get qatariTransactionAmount(): UntypedFormControl {
    return this.form.get('qatariTransactionAmount') as UntypedFormControl;
  }
}
