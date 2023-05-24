import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {LessonsLearned} from '@app/models/lessons-learned';
import {FieldAssessmentService} from '@app/services/field-assessment.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'lessons-learnt-popup',
  templateUrl: './lessons-learnt-popup.component.html',
  styleUrls: ['./lessons-learnt-popup.component.scss']
})
export class LessonsLearntPopupComponent extends UiCrudDialogGenericComponent<LessonsLearned> {
  popupTitleKey: keyof ILanguageKeys;
  lessonsLearntList: AdminResult[] = [];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<LessonsLearned>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private fieldAssessmentService: FieldAssessmentService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'lessons_learnt';
  }

  _getNewInstance(override?: Partial<LessonsLearned> | undefined): LessonsLearned {
    return new LessonsLearned().clone(override ?? {});
  }

  initPopup(): void {
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
