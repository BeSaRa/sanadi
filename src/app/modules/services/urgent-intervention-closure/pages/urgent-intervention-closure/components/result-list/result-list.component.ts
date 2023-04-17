import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ReadinessStatus} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {Subject} from 'rxjs';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@enums/user-click-on.enum';
import {Result} from '@models/result';
import { ResultListPopupComponent } from '../../../../popups/result-list-popup/result-list-popup.component';

@Component({
  selector: 'result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }


  ngOnInit(): void {
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

  private _list: Result[] = [];
  @Input() set list(list: Result[]) {
    this._list = list;
  }

  get list(): Result[] {
    return this._list;
  }

  displayedColumns = ['actions'];
  editItem?: Result;
  viewOnly: boolean = false;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  private save$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<Result | null> = new Subject<Result | null>();
  private currentRecord?: Result;
  private destroy$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');

  form!: UntypedFormGroup;
  actions: IMenuItem<Result>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Result) => this.edit(item),
      show: (_item: Result) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Result) => this.delete(item),
      show: (_item: Result) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Result) => this.view(item),
      show: (_item: Result) => this.readonly
    }
  ];

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }


  buildForm(): void {
    this.form = this.fb.group(new Result().buildForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new Result());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: Result | undefined) {
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
        this.form.enable()
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

        return (new Result()).clone({
          ...this.currentRecord, ...formValue
        });
      })
    ).subscribe((result: Result) => {
      if (!result) {
        return;
      }
      this._updateList(result, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (Result | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  edit(record: Result, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: Result, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: Result, $event?: MouseEvent): any {
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
    return ResultListPopupComponent;
  }

  openFormPopup() {
    this.dialogService.show(this._getPopupComponent(), {
      form : this.form,
      readonly : this.readonly,
      viewOnly : this.viewOnly,
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
}
