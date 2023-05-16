import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {BestPractices} from '@app/models/best-practices';
import {DialogService} from '@app/services/dialog.service';
import {FieldAssessmentService} from '@app/services/field-assessment.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'best-practices-popup',
  templateUrl: './best-practices-popup.component.html',
  styleUrls: ['./best-practices-popup.component.scss']
})
export class BestPracticesPopupComponent extends UiCrudDialogGenericComponent<BestPractices> {
  model: BestPractices;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  bestPracticesList: AdminResult[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<BestPractices>,
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

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: BestPractices, originalModel: BestPractices): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: BestPractices, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: BestPractices, form: UntypedFormGroup): Observable<BestPractices> | BestPractices {
    let formValue = form.getRawValue();
    let bestPracticesInfo = this.bestPracticesList.filter(x => formValue.bestPractices.includes(x.id));
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      bestPracticesInfo
    });
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

  searchNgSelect(term: string, item: AdminResult): boolean {
    return item.ngSelectSearch(term);
  }

  _getNewInstance(override?: Partial<BestPractices> | undefined): BestPractices {
    return new BestPractices().clone(override ?? {});
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
    this.popupTitleKey = 'best_practices';
    this.fieldAssessmentService.loadByType(FieldAssessmentTypesEnum.BEST_PRACTICES)
      .pipe(
        catchError(() => of([])),
        map(result => {
          return result.map(x => x.convertToAdminResult());
        })
      ).subscribe((result) => {
      this.bestPracticesList = result;
    });
  }
}
