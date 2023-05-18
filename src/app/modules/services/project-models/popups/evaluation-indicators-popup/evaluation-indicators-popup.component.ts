import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { EvaluationIndicator } from '@app/models/evaluation-indicator';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'evaluation-indicators-popup',
  templateUrl: './evaluation-indicators-popup.component.html',
  styleUrls: ['./evaluation-indicators-popup.component.scss']
})
export class EvaluationIndicatorsPopupComponent extends UiCrudDialogGenericComponent<EvaluationIndicator>{
  popupTitleKey!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  model: EvaluationIndicator;
  operation: OperationTypes;
  indicators: AdminLookup[] = [];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<EvaluationIndicator>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private adminLookupService:AdminLookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  initPopup(): void {
    this.popupTitleKey = 'project_evaluation_indicators';
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.TEMPLATE_INDICATOR).subscribe(list => {
      this.indicators = list;
    });
  }

  getPopupHeadingText(): string {
    return '';
  }

  _getNewInstance(override?: Partial<EvaluationIndicator> | undefined): EvaluationIndicator {
    return new EvaluationIndicator().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: EvaluationIndicator, originalModel: EvaluationIndicator): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: EvaluationIndicator, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: EvaluationIndicator, form: UntypedFormGroup): Observable<EvaluationIndicator> | EvaluationIndicator {
    let formValue = form.getRawValue();
    let indicatorInfo = this.indicators.find(x => x.id === formValue.indicator)?.createAdminResult() ?? new AdminResult()
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      indicatorInfo
    });
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
