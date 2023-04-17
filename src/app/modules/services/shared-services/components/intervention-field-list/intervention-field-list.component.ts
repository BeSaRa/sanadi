import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ReadinessStatus} from '@app/types/types';
import {InterventionField} from '@models/intervention-field';
import {Subject} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {filter, take, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@enums/user-click-on.enum';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import { InterventionFieldListPopupComponent } from '../../popups/intervention-field-list-popup/intervention-field-list-popup.component';

@Component({
  selector: 'intervention-field-list',
  templateUrl: './intervention-field-list.component.html',
  styleUrls: ['./intervention-field-list.component.scss']
})
export class InterventionFieldListComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  @Input() readonly: boolean = false;

  private _list: InterventionField[] = [];
  @Input() set list(list: InterventionField[]) {
    this._list = list;
  }

  get list(): InterventionField[] {
    return this._list;
  }

  displayedColumns = ['mainOcha', 'subOcha', 'actions'];
  editItem?: InterventionField;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<InterventionField | null> = new Subject<InterventionField | null>();
  private currentRecord?: InterventionField;
  private destroy$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');

  form!: UntypedFormGroup;
  actions: IMenuItem<InterventionField>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: InterventionField) => this.edit(item),
      show: (_item: InterventionField) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: InterventionField) => this.delete(item),
      show: (_item: InterventionField) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: InterventionField) => this.view(item),
      show: (_item: InterventionField) => this.readonly
    }
  ];
  sortingCallbacks = {
    mainOCha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.mainUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.mainUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    subOcha: (a: InterventionField, b: InterventionField, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.subUNOCHACategoryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.subUNOCHACategoryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
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

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  buildForm(): void {
    this.form = this.fb.group(new InterventionField().getInterventionFieldForm(true));
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewOnly = false;
        this.recordChanged$.next(new InterventionField());
      });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.updateForm(this.currentRecord);
    });
  }

  _getPopupComponent() {
    return InterventionFieldListPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getPopupComponent(), {
      viewOnly: this.viewOnly,
      readonly: this.readonly,
      form: this.form,
      editItem: this.editItem,
      model: this.currentRecord,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.save(data)
      } else {
        this.cancelForm()
      }
    })
  }
  private updateForm(record: InterventionField | undefined) {
    if (record) {
      if (this.viewOnly) {
        this._setComponentReadiness('READY');
      } else {
        this._setComponentReadiness('NOT_READY');
      }
      this.openFormDialog()
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save(model: InterventionField) {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next(model);
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
        const isDuplicate = this.list.some(x => x.mainUNOCHACategory === formValue.mainUNOCHACategory && x.subUNOCHACategory === formValue.subUNOCHACategory);
        if (isDuplicate) {
          this.toastService.alert(this.lang.map.msg_duplicated_item);
          this.openFormDialog()
        }
        return !isDuplicate;
      })
    ).subscribe((agency: InterventionField) => {
      if (!agency) {
        return;
      }
      this._updateList(agency, (!!this.editItem ? 'UPDATE' : 'ADD'));
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  private _updateList(record: (InterventionField | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

  edit(record: InterventionField, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: InterventionField, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete(record: InterventionField, $event?: MouseEvent): any {
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
}
