import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { FieldAssessmentTypesEnum } from '@app/enums/field-assessment-types.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { OfficeEvaluation } from '@app/models/office-evaluation';
import { DialogService } from '@app/services/dialog.service';
import { FieldAssessmentService } from '@app/services/field-assessment.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'implementation-evaluation-popup',
  templateUrl: './implementation-evaluation-popup.component.html',
  styleUrls: ['./implementation-evaluation-popup.component.scss']
})
export class ImplementationEvaluationPopupComponent extends UiCrudDialogGenericComponent<OfficeEvaluation>  {
  model: OfficeEvaluation;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  customValidators = CustomValidators
  evaluationHubList: AdminResult[] = [];
  evaluationResultList = this.lookupService.listByCategory.EvaluationResult;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<OfficeEvaluation>,
    public lang: LangService,
    public dialogRef: DialogRef,
    public dialogService: DialogService,
    public fb: UntypedFormBuilder,
    public toast: ToastService,
    private lookupService: LookupService,
    private fieldAssessmentService: FieldAssessmentService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  _getNewInstance(override?: Partial<OfficeEvaluation> | undefined): OfficeEvaluation {
    return new OfficeEvaluation().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'entities';
    this.loadEvaluationHubs();
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: OfficeEvaluation, originalModel: OfficeEvaluation): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: OfficeEvaluation, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }
  prepareModel(model: OfficeEvaluation, form: UntypedFormGroup): OfficeEvaluation | Observable<OfficeEvaluation> {
    let formValue = form.getRawValue();
    let evaluationHubInfo = this.evaluationHubList.find(x => x.id === formValue.evaluationHub) ?? new AdminResult();
    let evaluationResultInfo = this.evaluationResultList.find(x => x.lookupKey === formValue.evaluationResult)?.convertToAdminResult() ?? new AdminResult();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      evaluationHubInfo: evaluationHubInfo,
      evaluationResultInfo: evaluationResultInfo
    });
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }
  private loadEvaluationHubs() {
    this.fieldAssessmentService.loadByType(FieldAssessmentTypesEnum.EVALUATION_AXIS)
      .pipe(
        catchError(() => of([])),
        map(result => {
          return result.map(x => x.convertToAdminResult());
        })
      ).subscribe((result) => {
        this.evaluationHubList = result;
      });
  }
}
