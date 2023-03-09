import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ReadinessStatus } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { of, Subject } from 'rxjs';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { catchError, filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@enums/user-click-on.enum';
import { BestPractices } from '@models/best-practices';
import { AdminResult } from '@models/admin-result';
import { FieldAssessmentService } from '@services/field-assessment.service';
import { FieldAssessmentTypesEnum } from '@enums/field-assessment-types.enum';

@Component({
  selector: 'best-practices-list',
  templateUrl: './best-practices-list.component.html',
  styleUrls: ['./best-practices-list.component.scss']
})
export class BestPracticesListComponent implements OnInit {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fieldAssessmentService: FieldAssessmentService,
              private fb: UntypedFormBuilder) {
  }


  ngOnInit(): void {
    this.buildForm();
    this.loadBestPractices();
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

  private _list: BestPractices[] = [];
  @Input() set list(list: BestPractices[]) {
    this._list = list;
  }

  get list(): BestPractices[] {
    return this._list;
  }

  displayedColumns = ['bestPracticesListString', 'statement', 'actions'];
  editItem?: BestPractices;
  viewOnly: boolean = false;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  private save$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BestPractices | null> = new Subject<BestPractices | null>();
  private currentRecord?: BestPractices;
  private destroy$: Subject<any> = new Subject<any>();
  showForm: boolean = false;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  bestPracticesList: AdminResult[] = [];

  form!: UntypedFormGroup;
  actions: IMenuItem<BestPractices>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: BestPractices) => this.edit(item),
      show: (_item: BestPractices) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: BestPractices) => this.delete(item),
      show: (_item: BestPractices) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: BestPractices) => this.view(item),
      show: (_item: BestPractices) => this.readonly
    }
  ];

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }


  buildForm(): void {
    this.form = this.fb.group(new BestPractices().buildForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new BestPractices());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: BestPractices | undefined) {
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
      map(() => {
        let formValue = this.form.getRawValue();
        let bestPracticesInfo = this.bestPracticesList.filter(x => formValue.bestPractices.includes(x.id));

        return (new BestPractices()).clone({
          ...this.currentRecord, ...formValue,
          bestPracticesInfo: bestPracticesInfo
        });
      })
    ).subscribe((record: BestPractices) => {
      if (!record) {
        return;
      }
      this._updateList(record, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (BestPractices | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  edit(record: BestPractices, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: BestPractices, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: BestPractices, $event?: MouseEvent): any {
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

  private loadBestPractices() {
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

  searchNgSelect(term: string, item: AdminResult): boolean {
    return item.ngSelectSearch(term);
  }

}
