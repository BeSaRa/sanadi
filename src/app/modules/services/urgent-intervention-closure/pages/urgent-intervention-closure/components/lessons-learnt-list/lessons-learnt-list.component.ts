import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ReadinessStatus} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {of, Subject} from 'rxjs';
import {AdminResult} from '@models/admin-result';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {catchError, filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@enums/user-click-on.enum';
import {LessonsLearned} from '@models/lessons-learned';
import {FieldAssessmentTypesEnum} from '@enums/field-assessment-types.enum';
import {FieldAssessmentService} from '@services/field-assessment.service';
import { LessonsLearntPopupComponent } from './lessons-learnt-popup/lessons-learnt-popup.component';

@Component({
  selector: 'lessons-learnt-list',
  templateUrl: './lessons-learnt-list.component.html',
  styleUrls: ['./lessons-learnt-list.component.scss']
})
export class LessonsLearntListComponent implements OnInit {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fieldAssessmentService: FieldAssessmentService,
              private fb: UntypedFormBuilder) {
  }


  ngOnInit(): void {
    this.buildForm();
    this.loadLessonsLearnt();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;

  private _list: LessonsLearned[] = [];
  @Input() set list(list: LessonsLearned[]) {
    this._list = list;
  }

  get list(): LessonsLearned[] {
    return this._list;
  }

  displayedColumns = ['lessonsLearntListString', 'statement', 'actions'];
  editItem?: LessonsLearned;
  viewOnly: boolean = false;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  private save$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<LessonsLearned | null> = new Subject<LessonsLearned | null>();
  private currentRecord?: LessonsLearned;
  private destroy$: Subject<any> = new Subject<any>();
  showForm: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  lessonsLearntList: AdminResult[] = [];

  form!: UntypedFormGroup;
  actions: IMenuItem<LessonsLearned>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: LessonsLearned) => this.edit(item),
      show: (_item: LessonsLearned) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: LessonsLearned) => this.delete(item),
      show: (_item: LessonsLearned) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: LessonsLearned) => this.view(item),
      show: (_item: LessonsLearned) => this.readonly
    }
  ];

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }


  buildForm(): void {
    this.form = this.fb.group(new LessonsLearned().buildForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new LessonsLearned());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: LessonsLearned | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormPopup()
      this.form.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  private listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      tap(_ => this.form.invalid ? this.displayRequiredFieldsMessage() : true),
      filter(() => this.form.valid),
      map(() => {
        let formValue = this.form.getRawValue();
        let lessonsLearnedInfo = this.lessonsLearntList.filter(x => formValue.lessonsLearned.includes(x.id));

        return (new LessonsLearned()).clone({
          ...this.currentRecord, ...formValue,
          lessonsLearnedInfo: lessonsLearnedInfo
        });
      })
    ).subscribe((record: LessonsLearned) => {
      if (!record) {
        return;
      }
      this._updateList(record, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (LessonsLearned | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else {
        let index = !this.editItem ? -1 : this.list.findIndex(x => x === this.editItem);
        if (operation === 'UPDATE') {
          this.list.splice(index, 1, record);
        } else if (operation === 'DELETE') {
          this.list.splice(index, 1);
        }
      }
    }
    this.list = this.list.slice();
  }

  cancelForm() {
    this.resetForm();
    this.showForm = false;
    this.editItem = undefined;
    this.viewOnly = false;
    this._setComponentReadiness('READY');
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  forceClearComponent() {
    this.cancelForm();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }

  edit(record: LessonsLearned, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: LessonsLearned, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: LessonsLearned, $event?: MouseEvent): any {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.editItem = record;
          this._updateList(record, 'DELETE');
          this.toastService.success(this.lang.map.msg_delete_success);
          this.cancelForm();
        }
      });
  }

  _getPopupComponent() {
    return LessonsLearntPopupComponent;
  }

  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form : this.form,
      readonly : this.readonly,
      viewOnly : this.viewOnly,
      lessonsLearntList : this.lessonsLearntList,
      editItem : this.editItem,
      model : this.currentRecord,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save()
      } else {
        this.cancelForm();
      }
    })
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
