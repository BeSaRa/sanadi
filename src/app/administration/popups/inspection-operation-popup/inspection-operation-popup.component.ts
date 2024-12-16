import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionOperation } from '@app/models/inspection-operation';
import { InternalDepartment } from '@app/models/internal-department';
import { Lookup } from '@app/models/lookup';
import { EmployeeService } from '@app/services/employee.service';
import { InspectionOperationService } from '@app/services/inspection-operation.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'inspection-operation-popup',
  templateUrl: 'inspection-operation-popup.component.html',
  styleUrls: ['inspection-operation-popup.component.scss'],
})
export class InspectionOperationPopupComponent extends AdminGenericDialog<InspectionOperation> {

  form!: UntypedFormGroup;
  model!: InspectionOperation;
  operation: OperationTypes;
  saveVisible = true;
  mainOperations: InspectionOperation[] = [];
  ActualInspectionTaskTypes: Lookup[] = this.lookupService.listByCategory.ActualInspectionTaskType;
  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<InspectionOperation> & { mainOperations: InspectionOperation[] },
    private toast: ToastService,
    private internalDepartmentService: InternalDepartmentService,
    private employeeService: EmployeeService,
    private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    data.mainOperations && (this.mainOperations = data.mainOperations)
  }

  initPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: InspectionOperation, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: InspectionOperation, form: UntypedFormGroup): Observable<InspectionOperation> | InspectionOperation {
    return (new InspectionOperation()).clone({
      ...model, ...form.value,
      clientData: `${this.employeeService.getCurrentUser().id}`
    });
  }

  afterSave(model: InspectionOperation, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_Inspection_Operation;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }

}
