import { ProposedTaskTypes } from './../../../../../enums/proposed-task-types';
import { LookupService } from '@app/services/lookup.service';
import { Component, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ReceiverTypes } from '@app/enums/receiver-type.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InternalDepartment } from '@app/models/internal-department';
import { Lookup } from '@app/models/lookup';
import { ProposedInspection } from '@app/models/proposed-inspection';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CustomValidators } from '@app/validators/custom-validators';
import { EmployeeService } from '@app/services/employee.service';

@Component({
    selector: 'proposed-inspection-popup',
    templateUrl: 'proposed-inspection-popup.component.html',
    styleUrls: ['proposed-inspection-popup.component.scss'],
    changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProposedInspectionPopupComponent extends AdminGenericDialog<ProposedInspection> {

  form!: UntypedFormGroup;
  model!: ProposedInspection;
  operation: OperationTypes;
  saveVisible = true;
  departmentsList$:Observable<InternalDepartment[]>=new Observable<InternalDepartment[]>;
  proposedTaskTypes :Lookup[] = this.lookupService.listByCategory.ProposedInspectionTaskType
  priorities :Lookup[] = this.lookupService.listByCategory.PriorityType
  readonly :boolean = false;
  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ProposedInspection>,
    private toast: ToastService,
    private internalDepartmentService:InternalDepartmentService,
    private lookupService:LookupService,
    private employeeService:EmployeeService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.departmentsList$= this.internalDepartmentService.loadAsLookups()

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
      this.readonly = true;
    }
    this._listenToProposedTaskTypeControlChanges();
  }

  beforeSave(model: ProposedInspection, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: ProposedInspection, form: UntypedFormGroup): Observable<ProposedInspection> | ProposedInspection {
    return (new ProposedInspection()).clone({ ...model, ...form.value,
    createdby: this.employeeService.getCurrentUser().generalUserId });
  }

  afterSave(model: ProposedInspection, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: this.lang.map.lbl_proposed_task }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
   if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_proposed_inspection;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };
  get isOtherProposedTaskType ():boolean{
    return this.proposedTaskTypeControl.value === ProposedTaskTypes.OTHER
  }
  get isComplainProposedTaskType ():boolean{
    return this.proposedTaskTypeControl.value === ProposedTaskTypes.COMPLAINT
  }

  get proposedTaskTypeControl(): UntypedFormGroup {
    return this.form.get('proposedTaskType') as UntypedFormGroup;
  }
  get otherProposedTaskControl(): UntypedFormGroup {
    return this.form.get('otherProposedTask') as UntypedFormGroup;
  }
  get complaintNumberControl(): UntypedFormGroup {
    return this.form.get('complaintNumber') as UntypedFormGroup;
  }
  destroyPopup(): void {
  }

  private _listenToProposedTaskTypeControlChanges(){
    this.proposedTaskTypeControl.valueChanges.pipe(
      tap(_=>{
        this.complaintNumberControl.clearValidators();
        this.complaintNumberControl.updateValueAndValidity();
        this.otherProposedTaskControl.clearValidators();
        this.otherProposedTaskControl.updateValueAndValidity();
      }),
      tap((value:ReceiverTypes)=>{
        if(value === ReceiverTypes.OTHER){
          this.otherProposedTaskControl.setValidators([CustomValidators.required])
          this.otherProposedTaskControl.updateValueAndValidity()
        }
        if(value === ReceiverTypes.PARTNER){
          this.complaintNumberControl.setValidators([CustomValidators.required])
          this.complaintNumberControl.updateValueAndValidity()
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }
}


