import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { AdminGenericDialog } from "@app/generics/admin-generic-dialog";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { Lookup } from "@app/models/lookup";
import { OrganizationUnitField } from "@app/models/organization-unit-field";
import { DialogService } from "@app/services/dialog.service";
import { LangService } from "@app/services/lang.service";
import { LookupService } from "@app/services/lookup.service";
import { ToastService } from "@app/services/toast.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { Observable } from "rxjs";

@Component({
  selector: "organization-unit-field-popup",
  templateUrl: "./organization-unit-field-popup.component.html",
  styleUrls: ["./organization-unit-field-popup.component.scss"],
})
export class OrganizationUnitFieldPopupComponent extends AdminGenericDialog<OrganizationUnitField> {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  model: OrganizationUnitField;
  form!: FormGroup;
  operation: OperationTypes;
  saveVisible = true;
  constructor(
    public dialogRef: DialogRef,
    public fb: FormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrganizationUnitField>,
    private dialogService: DialogService,
    private toast: ToastService,
    private lookupService: LookupService
  ) {
    super();
   
    this.model = data.model;
    this.operation = data.operation;
  }
  initPopup(): void {}

  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }
  afterSave(model: OrganizationUnitField, dialogRef: DialogRef): void {
    const message =
      this.operation === OperationTypes.CREATE
        ? this.lang.map.msg_create_x_success
        : this.lang.map.msg_update_x_success;

    this.operation===this.operationTypes.CREATE
    ?this.toast.success(message.change({ x:this.form.controls[this.lang.map.lang+'Name'].value }))   
    :this.toast.success(message.change({ x: model.getName() }));    
    
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }
  beforeSave(
    model: OrganizationUnitField,
    form: FormGroup
  ): boolean | Observable<boolean> {
    return form.valid;
  }
  prepareModel(
    model: OrganizationUnitField,
    form: FormGroup
  ): OrganizationUnitField | Observable<OrganizationUnitField> {
    return new OrganizationUnitField().clone({ ...model, ...form.value });
  }
  saveFail(error: Error): void {}
  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_org_unit_field;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_org_unit_field;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return "";
  }
}
