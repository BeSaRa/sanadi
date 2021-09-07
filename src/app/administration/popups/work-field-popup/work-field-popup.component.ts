import {Component, Inject} from '@angular/core';
import {FormManager} from '@app/models/form-manager';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {WorkField} from '@app/models/work-field';
import {Observable, Subject} from 'rxjs';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {WorkFieldService} from '@app/services/work-field.service';

@Component({
  selector: 'work-field-popup',
  templateUrl: './work-field-popup.component.html',
  styleUrls: ['./work-field-popup.component.scss']
})
export class WorkFieldPopupComponent extends AdminGenericDialog<WorkField> {
  workFieldTypeId!: number;
  classification!: Lookup;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: WorkField;
  validateFieldsVisible = true;
  saveVisible = true;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    subWorkFields: {name: 'subWorkFields'}
  };
  validToAddSubWorkFields = false;
  columns = ['arName', 'enName', 'status', 'actions'];
  subWorkFields: WorkField[] = [];
  reloadSubWorkFields$: Subject<void> = new Subject<void>();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<WorkField>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public workFieldService: WorkFieldService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.workFieldTypeId = data.workFieldTypeId;
  }

  initPopup(): void {
    this.validToAddSubWorkFields = this.model.id != null;
    this.listenToReloadSubWorkFields();
    this.reloadSubWorkFields$.next();

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
    const workField = (new WorkField()).clone({...model, ...form.value});
    workField.type = this.workFieldTypeId;
    return workField;
  }

  afterSave(model: WorkField, dialogRef: DialogRef): void {
    this.validToAddSubWorkFields = true;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_work_field.change({x: this.classification.getName()}) :
      this.lang.map.edit_work_field.change({x: this.classification.getName()});
  };

  addSubWorkField(): void {
    const sub = this.workFieldService.openCreateSubWorkFieldDialog(this.model.id, this.workFieldTypeId).onAfterClose$.subscribe(() => {
      this.reloadSubWorkFields$.next();
      sub.unsubscribe();
    });
  }

  edit(subWorkField: WorkField, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.workFieldService.openUpdateSubWorkFieldDialog(subWorkField.id, this.workFieldTypeId, this.model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reloadSubWorkFields$.next();
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
          this.reloadSubWorkFields$.next();
          sub.unsubscribe();
        });
      }
    });
  }

  listenToReloadSubWorkFields() {
    this.reloadSubWorkFields$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      if (this.model.id) {
        this.model.loadSubWorkFields()
          .pipe(takeUntil(this.destroy$))
          .subscribe(subWorkFields => {
            this.subWorkFields = subWorkFields;
          });
      }
    });
  }

  destroyPopup(): void {
  }
}
