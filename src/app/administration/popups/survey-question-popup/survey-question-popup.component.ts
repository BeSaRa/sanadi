import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {SurveyQuestion} from "@app/models/survey-question";
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";

@Component({
  selector: 'survey-question-popup',
  templateUrl: './survey-question-popup.component.html',
  styleUrls: ['./survey-question-popup.component.scss']
})
export class SurveyQuestionPopupComponent extends AdminGenericDialog<SurveyQuestion> {
  model!: SurveyQuestion;
  form!: FormGroup;
  operation: OperationTypes = OperationTypes.CREATE;

  get dialogTitle() {
    return this.operation === OperationTypes.CREATE ? this.lang.map.add_question : this.lang.map.edit_question;
  };

  constructor(public fb: FormBuilder,
              @Inject(DIALOG_DATA_TOKEN)
              private data: IDialogData<SurveyQuestion>,
              public lang: LangService,
              private toast: ToastService,
              public dialogRef: DialogRef) {
    super()
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {

  }

  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  afterSave(model: SurveyQuestion, dialogRef: DialogRef): void {
    this.model = model;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: this.model.getName()}));
    this.dialogRef.close(this.model);
  }

  beforeSave(model: SurveyQuestion, form: FormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: SurveyQuestion, form: FormGroup): SurveyQuestion | Observable<SurveyQuestion> {
    return new SurveyQuestion().clone({...this.model, ...this.form.value});
  }

  saveFail(error: Error): void {
    console.log('SAVE FAILD');
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true))
  }

}
