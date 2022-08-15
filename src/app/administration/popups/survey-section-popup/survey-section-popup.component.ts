import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {SurveySection} from "@app/models/survey-section";
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";

@Component({
  selector: 'survey-section-popup',
  templateUrl: './survey-section-popup.component.html',
  styleUrls: ['./survey-section-popup.component.scss']
})
export class SurveySectionPopupComponent extends AdminGenericDialog<SurveySection> {
  model: SurveySection;
  form!: UntypedFormGroup;
  operation: OperationTypes = OperationTypes.CREATE;


  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              private toast: ToastService,
              @Inject(DIALOG_DATA_TOKEN)
              private data: IDialogData<SurveySection>,
              public fb: UntypedFormBuilder) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {

  }

  destroyPopup(): void {

  }

  afterSave(model: SurveySection, dialogRef: DialogRef): void {
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  beforeSave(model: SurveySection, form: UntypedFormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: SurveySection, form: UntypedFormGroup): SurveySection | Observable<SurveySection> {
    return new SurveySection().clone({
      ...this.model,
      ...this.form.value,
    });
  }

  saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

}
