import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {LessonsLearned} from '@app/models/lessons-learned';
import {DialogService} from '@app/services/dialog.service';
import {FieldAssessmentService} from '@app/services/field-assessment.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'lessons-learnt-popup',
  templateUrl: './lessons-learnt-popup.component.html',
  styleUrls: ['./lessons-learnt-popup.component.scss']
})
export class LessonsLearntPopupComponent extends UiCrudDialogGenericComponent<LessonsLearned> {
  model: LessonsLearned;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  customValidators = CustomValidators
  lessonsLearntList: AdminResult[] = [];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<LessonsLearned>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private fieldAssessmentService: FieldAssessmentService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  _getNewInstance(override?: Partial<LessonsLearned> | undefined): LessonsLearned {
    return new LessonsLearned().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'lessons_learnt';
    this.loadLessonsLearnt();
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: LessonsLearned, originalModel: LessonsLearned): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: LessonsLearned, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: LessonsLearned, form: UntypedFormGroup): LessonsLearned | Observable<LessonsLearned> {
    let formValue = form.getRawValue();
    let lessonsLearnedInfo = this.lessonsLearntList.filter(x => formValue.lessonsLearned.includes(x.id));
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      lessonsLearnedInfo: lessonsLearnedInfo
    });
  }

  saveFail(error: Error): void {
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  searchNgSelect(term: string, item: AdminResult): boolean {
    return item.ngSelectSearch(term);
  }

  private loadLessonsLearnt() {
    this.fieldAssessmentService.loadByType(FieldAssessmentTypesEnum.LESSONS_LEARNT)
      .pipe(
        catchError(() => of([])),
        map(result => {
          return result.map(x => x.convertToAdminResult());
        })
      ).subscribe((result) => {
      this.lessonsLearntList = result;
    });
  }

}
