import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {WorkField} from '@app/models/work-field';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {FormManager} from '@app/models/form-manager';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'sub-work-field-popup',
  templateUrl: './sub-work-field-popup.component.html',
  styleUrls: ['./sub-work-field-popup.component.scss']
})
export class SubWorkFieldPopupComponent extends AdminGenericDialog<WorkField> {
  parentId?: number;
  workFieldTypeId!: number;
  classification!: Lookup;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: WorkField;
  saveVisible = true;
  columns = ['arName', 'enName', 'status', 'actions'];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<WorkField>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.parentId = data.parentId;
    this.workFieldTypeId = data.workFieldTypeId;
  }

  initPopup(): void {
    this.classification = this.lookupService.listByCategory.ServiceWorkField
      .find(classification => classification.lookupKey === this.workFieldTypeId)!;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  beforeSave(model: WorkField, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: WorkField, form: FormGroup): Observable<WorkField> | WorkField {
    model.parentId = this.parentId;
    model.type = this.workFieldTypeId;
    return (new WorkField()).clone({...model, ...form.value});
  }

  afterSave(model: WorkField, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    this.dialogRef.close(this.model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_sub_work_field.change({x: this.classification.getName()}) :
      this.lang.map.edit_sub_work_field.change({x: this.classification.getName()});
  };

  edit(subWorkField: WorkField, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.model.service.openUpdateSubWorkFieldDialog(subWorkField.id, this.model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  delete(event: MouseEvent, model: WorkField): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          sub.unsubscribe();
        });
      }
    });
  }

  destroyPopup(): void {
  }
}
