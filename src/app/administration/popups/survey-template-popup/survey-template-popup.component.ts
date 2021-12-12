import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {SurveyTemplate} from '@app/models/survey-template';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ToastService} from "@app/services/toast.service";
import {SurveySection} from "@app/models/survey-section";
import {SurveySectionService} from "@app/services/survey-section.service";
import {filter, switchMap, takeUntil, tap} from "rxjs/operators";
import {DialogService} from "@app/services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {SurveyQuestionService} from "@app/services/survey-question.service";
import {SurveyQuestion} from "@app/models/survey-question";
import {IQuestionSection} from "@app/interfaces/i-question-section";

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
  editSection$: Subject<{ index: number, model: SurveySection }> = new Subject<{ index: number, model: SurveySection }>();
  deleteSection$: Subject<{ index: number, model: SurveySection }> = new Subject<{ index: number, model: SurveySection }>();
  addQuestion$: Subject<number> = new Subject<number>();

  constructor(public lang: LangService,
              public dialogRef: DialogRef,
              private toast: ToastService,
              private surveyQuestionService: SurveyQuestionService,
              private surveySectionService: SurveySectionService,
              @Inject(DIALOG_DATA_TOKEN)
              private data: IDialogData<SurveyTemplate>,
              private dialog: DialogService,
              public fb: FormBuilder) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
  }


  initPopup(): void {
    this.listenToAddSection();
    this.listenToEditSection();
    this.listenToDeleteSection();
    this.listenToAddQuestion();
  }

  destroyPopup(): void {

  }

  afterSave(model: SurveyTemplate, dialogRef: DialogRef): void {
    this.model = model;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.operation === OperationTypes.UPDATE ? this.dialogRef.close(model) : (this.operation = OperationTypes.UPDATE);
  }

  beforeSave(model: SurveyTemplate, form: FormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: SurveyTemplate, form: FormGroup): SurveyTemplate | Observable<SurveyTemplate> {
    return new SurveyTemplate().clone({
      ...this.model,
      ...this.form.value,
    }).sortBasedOnIndex();
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm());
  }

  get dialogTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.add_survey_template : this.lang.map.edit_survey_template;
  };

  dropSection($event: CdkDragDrop<SurveySection[]>) {
    moveItemInArray(this.model.sectionSet, $event.previousIndex, $event.currentIndex);
  }

  private listenToAddSection() {
    this.addSection$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(_ => (this.surveySectionService.addDialog().onAfterClose$ as Observable<SurveySection>)))
      .pipe(filter(value => !!value))
      .subscribe((section) => {
        this.model.sectionSet = this.model.sectionSet.concat(section);
      })
  }

  private listenToEditSection() {
    let editIndex: number = 0;
    this.editSection$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(({index, model}) => {
        editIndex = index;
        return this.surveySectionService.editDialog(model, false)
      }))
      .pipe(switchMap(ref => ref.onAfterClose$ as Observable<SurveySection>))
      .pipe(filter(value => !!value))
      .subscribe((editedSection) => {
        this.model.sectionSet = this.model.sectionSet.map((section, i) => {
          return editIndex === i ? editedSection : section;
        });
      })
  }

  private listenToDeleteSection() {
    let deleteIndex: number = 0;
    this.deleteSection$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(({index}) => deleteIndex = index))
      .pipe(switchMap(({model}) => this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: model.getName()})).onAfterClose$ as Observable<UserClickOn>))
      .pipe(filter(click => click === UserClickOn.YES))
      .subscribe(() => {
        this.model.sectionSet = this.model.sectionSet.filter((item, index) => index !== deleteIndex);
      })
  }

  private listenToAddQuestion() {
    let sectionIndex: number;
    this.addQuestion$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(index => sectionIndex = index))
      .pipe(switchMap(() => this.surveyQuestionService.loadIfNotExists()))
      .pipe(switchMap(questions => (this.surveyQuestionService.openSelectQuestion(questions, this.model.getQuestionsIds()).onAfterClose$ as Observable<SurveyQuestion>)))
      .pipe(filter(val => !!val))
      .subscribe((question) => {
        this.model.sectionSet = this.model.sectionSet.map((section, index) => {
          if (sectionIndex === index) {
            section.questionSet = section.questionSet.concat({question, questionOrder: 0});
          }
          return section;
        })
      })
  }

  deleteQuestion(q: IQuestionSection, questionIndex: number, sectionIndex: number) {
    of(null)
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(_ => this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({x: q.question.getName()})).onAfterClose$ as Observable<UserClickOn>))
      .pipe(filter(val => val === UserClickOn.YES))
      .subscribe(() => {
        this.model.sectionSet[sectionIndex].questionSet = this.model.sectionSet[sectionIndex].questionSet.filter((q, index) => index !== questionIndex);
      })
  }

  dropQuestion($event: CdkDragDrop<IQuestionSection[]>, sectionIndex: number) {
    moveItemInArray(this.model.sectionSet[sectionIndex].questionSet, $event.previousIndex, $event.currentIndex);
  }

  cannotAddSections(): boolean {
    return this.model.sectionSet.length >= 6;
  }
}
