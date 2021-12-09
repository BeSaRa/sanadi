import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { SurveyTemplate } from '@app/models/survey-template';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'survey-template-popup',
  templateUrl: './survey-template-popup.component.html',
  styleUrls: ['./survey-template-popup.component.scss'],
})
export class SurveyTemplatePopupComponent extends AdminGenericDialog<SurveyTemplate> {
  model: SurveyTemplate;
  form!: FormGroup;
  operation!: OperationTypes;
  reloadSections$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  addSection$: Subject<any> = new Subject<any>();
  sections: any[] = [
    { id: 1, start: true },
    { id: 2, start: true },
    { id: 3, start: true },
    { id: 4, start: true },
    { id: 5, start: true },
  ];

  constructor(public lang: LangService,
              public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN)
              private data: IDialogData<SurveyTemplate>,
              public fb: FormBuilder) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
  }


  initPopup(): void {

  }

  destroyPopup(): void {

  }

  afterSave(model: SurveyTemplate, dialogRef: DialogRef): void {

  }

  beforeSave(model: SurveyTemplate, form: FormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: SurveyTemplate, form: FormGroup): SurveyTemplate | Observable<SurveyTemplate> {
    return new SurveyTemplate().clone({
      ...this.model,
      ...this.form.value,
    });
  }

  saveFail(error: Error): void {
    console.log('FAIL');
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm());
  }

  get dialogTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.add_survey_template : this.lang.map.edit_survey_template;
  };

  dropSection($event: CdkDragDrop<any[]>) {
    moveItemInArray(this.sections, $event.previousIndex, $event.currentIndex);
  }
}
