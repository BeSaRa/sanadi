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
import {DialogService} from '@app/services/dialog.service';
import {FinancialTransferLicensingService} from '@app/services/financial-transfer-licensing.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'financial-transfers-projects-popup',
  templateUrl: './financial-transfers-projects-popup.component.html',
  styleUrls: ['./financial-transfers-projects-popup.component.scss']
})
export class FinancialTransfersProjectsPopupComponent extends UiCrudDialogGenericComponent<FinancialTransfersProject> {
  model: FinancialTransfersProject;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  financialTransferProjectControl!: UntypedFormControl;
  selectedProject: FinancialTransfersProject;
  inputMaskPatterns = CustomValidators.inputMaskPatterns
  approvedFinancialTransferProjects: ExternalProjectLicensing[] = []
  lastQatariTransactionAmountValue: any;
  requestType!: number;
  submissionMechanism!: number;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<FinancialTransfersProject>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private financialTransferLicensingService: FinancialTransferLicensingService
  ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.selectedProject = data.extras?.selectedProject
    this.requestType = data.extras?.requestType
    this.submissionMechanism = data.extras?.submissionMechanism
    this.approvedFinancialTransferProjects = data.extras?.approvedFinancialTransferProjects;
  }

  _getNewInstance(override?: Partial<FinancialTransfersProject> | undefined): FinancialTransfersProject {
    return new FinancialTransfersProject().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'lbl_projects';
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
