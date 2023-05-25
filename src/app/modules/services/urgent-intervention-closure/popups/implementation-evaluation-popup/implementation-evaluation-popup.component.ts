import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {FieldAssessmentService} from '@app/services/field-assessment.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'implementation-evaluation-popup',
  templateUrl: './implementation-evaluation-popup.component.html',
  styleUrls: ['./implementation-evaluation-popup.component.scss']
})
export class ImplementationEvaluationPopupComponent extends UiCrudDialogGenericComponent<OfficeEvaluation> {
  popupTitleKey: keyof ILanguageKeys;
  evaluationHubList: AdminResult[] = [];
  evaluationResultList = this.lookupService.listByCategory.EvaluationResult;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<OfficeEvaluation>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private fieldAssessmentService: FieldAssessmentService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'entities';
  }

  _getNewInstance(override?: Partial<OfficeEvaluation> | undefined): OfficeEvaluation {
    return new OfficeEvaluation().clone(override ?? {});
  }

  initPopup(): void {
    this.loadEvaluationHubs();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: OfficeEvaluation, originalModel: OfficeEvaluation): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<OfficeEvaluation>, record2: Partial<OfficeEvaluation>): boolean {
    return (record1 as OfficeEvaluation).isEqual(record2 as OfficeEvaluation);
  }

  beforeSave(model: OfficeEvaluation, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }

    if (this.isDuplicateInList(form.getRawValue())) {
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
