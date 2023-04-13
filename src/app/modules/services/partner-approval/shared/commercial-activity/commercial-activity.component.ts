import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { UserClickOn } from '@enums/user-click-on.enum';
import { CommercialActivity } from '@models/commercial-activity';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { CommercialActivityPopupComponent } from './commercial-activity-popup/commercial-activity-popup.component';

@Component({
  selector: 'commercial-activity',
  templateUrl: './commercial-activity.component.html',
  styleUrls: ['./commercial-activity.component.css']
})
export class CommercialActivityComponent implements OnInit {

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

private _list: CommercialActivity[] = [];
@Input() set list(list: CommercialActivity[]) {
  this._list = list;
}

get list(): CommercialActivity[] {
  return this._list;
}
displayedColumns = ['activityName', 'details', 'actions'];
editItem?: CommercialActivity;
viewOnly: boolean = false;
private save$: Subject<any> = new Subject<any>();
add$: Subject<any> = new Subject<any>();
private recordChanged$: Subject<CommercialActivity | null> = new Subject<CommercialActivity | null>();
private currentRecord?: CommercialActivity;
private destroy$: Subject<any> = new Subject<any>();
filterControl: UntypedFormControl = new UntypedFormControl('');

form!: UntypedFormGroup;
actions: IMenuItem<CommercialActivity>[] = [
  // edit
  {
    type: 'action',
    icon: ActionIconsEnum.EDIT,
    label: 'btn_edit',
    onClick: (item: CommercialActivity) => this.edit(item),
    show: (_item: CommercialActivity) => !this.readonly
  },
  // delete
  {
    type: 'action',
    icon: ActionIconsEnum.DELETE,
    label: 'btn_delete',
    onClick: (item: CommercialActivity) => this.delete(item),
    show: (_item: CommercialActivity) => !this.readonly
  },
  // view
  {
    type: 'action',
    icon: ActionIconsEnum.VIEW,
    label: 'view',
    onClick: (item: CommercialActivity) => this.view(item),
  }
];

private _setComponentReadiness(readyStatus: ReadinessStatus) {
  this.readyEvent.emit(readyStatus);
}

buildForm(): void {
  this.form = this.fb.group(new CommercialActivity().buildForm(true));
}

private listenToAdd() {
  this.add$.pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new CommercialActivity());
    });
}
_getPopupComponent() {
  return CommercialActivityPopupComponent;
}
openFormDialog() {
  this.dialogService.show(this._getPopupComponent(), {
    viewOnly: this.viewOnly,
    readonly: this.readonly,
    form: this.form,
    editItem: this.editItem,
    model: this.currentRecord
  }).onAfterClose$.subscribe((data) => {
    if(data) {
      this.save(data)
    } else {
      this.cancelForm()
    }
  })
}
private listenToRecordChange() {
  this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
    this.currentRecord = record || undefined;
    this.updateForm(this.currentRecord);
  });
}

private updateForm(record: CommercialActivity | undefined) {
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

save(model: CommercialActivity) {
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
  ).subscribe((record: CommercialActivity) => {
    if (!record) {
      return;
    }
    this._updateList(record, (!!this.editItem ? 'UPDATE' : 'ADD'));
    this.toastService.success(this.lang.map.msg_save_success);
    this.recordChanged$.next(null);
    this.cancelForm();
  });
}

private _updateList(record: (CommercialActivity | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE') {
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

edit(record: CommercialActivity, $event?: MouseEvent) {
  $event?.preventDefault();
  if (this.readonly) {
    return;
  }
  this.editItem = record;
  this.viewOnly = false;
  this.recordChanged$.next(record);
}

view(record: CommercialActivity, $event?: MouseEvent) {
  $event?.preventDefault();
  this.editItem = record;
  this.viewOnly = true;
  this.recordChanged$.next(record);
}

delete(record: CommercialActivity, $event?: MouseEvent): any {
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
