import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ReadinessStatus} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {of, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {catchError, filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {LookupService} from '@services/lookup.service';
import {FieldAssessmentService} from '@services/field-assessment.service';
import {AdminResult} from '@app/models/admin-result';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';

@Component({
  selector: 'implementation-evaluation-list',
  templateUrl: './implementation-evaluation-list.component.html',
  styleUrls: ['./implementation-evaluation-list.component.scss']
})
export class ImplementationEvaluationListComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private fieldAssessmentService: FieldAssessmentService,
              private fb: UntypedFormBuilder) {
  }


  ngOnInit(): void {
    this.loadEvaluationHubs();
    this.buildForm();
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

  private _list: OfficeEvaluation[] = [];
  @Input() set list(list: OfficeEvaluation[]) {
    this._list = list;
  }

  get list(): OfficeEvaluation[] {
    return this._list;
  }

  evaluationHubList: AdminResult[] = [];
  evaluationResultList = this.lookupService.listByCategory.EvaluationResult;

  displayedColumns = ['evaluationHub', 'evaluationResult', 'notes', 'actions'];
  editItem?: OfficeEvaluation;
  viewOnly: boolean = false;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  private save$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<OfficeEvaluation | null> = new Subject<OfficeEvaluation | null>();
  private currentRecord?: OfficeEvaluation;
  private destroy$: Subject<any> = new Subject<any>();
  showForm: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  form!: UntypedFormGroup;
  actions: IMenuItem<OfficeEvaluation>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OfficeEvaluation) => this.edit(item),
      show: (_item: OfficeEvaluation) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OfficeEvaluation) => this.delete(item),
      show: (_item: OfficeEvaluation) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: OfficeEvaluation) => this.view(item),
      show: (_item: OfficeEvaluation) => this.readonly
    }
  ];

  sortingCallbacks = {
    evaluationHub: (a: OfficeEvaluation, b: OfficeEvaluation, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.evaluationHubInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.evaluationHubInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    evaluationResult: (a: OfficeEvaluation, b: OfficeEvaluation, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.evaluationResultInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.evaluationResultInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }


  buildForm(): void {
    this.form = this.fb.group(new OfficeEvaluation().buildForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new OfficeEvaluation());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: OfficeEvaluation | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.form.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
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
      filter(() => {
        const formValue = this.form.getRawValue();
        const isDuplicate = this.list.some(x => x.evaluationHub === formValue.evaluationHub && x.evaluationResult === formValue.evaluationResult);
        if (isDuplicate) {
          this.toastService.alert(this.lang.map.msg_duplicated_item);
        }
        return !isDuplicate;
      }),
      map(() => {
        let formValue = this.form.getRawValue();
        let evaluationHubInfo = this.evaluationHubList.find(x => x.id === formValue.evaluationHub) ?? new AdminResult();
        let evaluationResultInfo = this.evaluationResultList.find(x => x.lookupKey === formValue.evaluationResult)?.convertToAdminResult() ?? new AdminResult();

        return (new OfficeEvaluation()).clone({
          ...this.currentRecord, ...formValue,
          evaluationHubInfo: evaluationHubInfo,
          evaluationResultInfo: evaluationResultInfo
        });
      })
    ).subscribe((result: OfficeEvaluation) => {
      if (!result) {
        return;
      }
      this._updateList(result, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (OfficeEvaluation | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  edit(record: OfficeEvaluation, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: OfficeEvaluation, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: OfficeEvaluation, $event?: MouseEvent): any {
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
