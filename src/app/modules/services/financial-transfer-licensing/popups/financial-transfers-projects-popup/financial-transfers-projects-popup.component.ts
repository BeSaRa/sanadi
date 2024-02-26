import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { FinancialTransferRequestTypes } from '@app/enums/service-request-types';
import { SubmissionMechanisms } from '@app/enums/submission-mechanisms.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ExternalProjectLicensing } from '@app/models/external-project-licensing';
import { FinancialTransfersProject } from '@app/models/financial-transfers-project';
import { EmployeeService } from '@app/services/employee.service';
import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';

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
    private financialTransferLicensingService: FinancialTransferLicensingService,
    private employeeService: EmployeeService
  ) {
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
    this._loadExternalProjects();
  }
  private _loadExternalProjects() {
    let criteria = this.operation === OperationTypes.VIEW ? {
      fullSerial: this.model.fullSerial
    } : this.employeeService.isExternalUser() ? {
      organizationId: this.employeeService.getCurrentUser().getProfileId()
    } :
      {};
    this.financialTransferLicensingService
      .loadEternalProjects(criteria)
      .pipe(
        take(1),
        map((projects) =>
          projects.map((x) => new ExternalProjectLicensing().clone(x))
        )
      )
      .subscribe((projects) => {
        this.approvedFinancialTransferProjects = projects;
        const approvedProject = this.approvedFinancialTransferProjects?.find(x => x.fullSerial === this.model.fullSerial);
        this.financialTransferProjectControl.patchValue(approvedProject?.id);

      });
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

  _isDuplicate(record1: Partial<FinancialTransfersProject>, record2: Partial<FinancialTransfersProject>): boolean {
    return (record1 as FinancialTransfersProject).isEqual(record2 as FinancialTransfersProject);
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

    if (this.isDuplicateInList(form.getRawValue())) {
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
      projectLicenseId: this.selectedProject!.projectLicenseId,
      remainingAmount: this.selectedProject!.remainingAmount,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getFormFields(true));
    this.financialTransferProjectControl = this.fb.control([]);
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

        this.form.patchValue({ ...project, qatariTransactionAmount: this.qatariTransactionAmount.value });
        this.selectedProject = project
      });
  }

  get qatariTransactionAmount(): UntypedFormControl {
    return this.form.get('qatariTransactionAmount') as UntypedFormControl;
  }
}
