import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DynamicModel } from '@app/models/dynamic-model';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subscription, Observable } from 'rxjs';
import { v4 } from 'uuid';
import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { Lookup } from '@app/models/lookup';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { LookupService } from '@app/services/lookup.service';
import { TemplateField } from '@app/models/template-field';

@Component({
  selector: 'app-dynamic-model-popup',
  templateUrl: './dynamic-model-popup.component.html',
  styleUrls: ['./dynamic-model-popup.component.scss']
})
export class DynamicModelPopupComponent extends AdminGenericDialog<DynamicModel> {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  commonStatusEnum = CommonStatusEnum;
  form!: UntypedFormGroup;
  fieldForm!: UntypedFormGroup;
  model!: DynamicModel;
  operation: OperationTypes;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  processForm: ProcessFieldBuilder;
  listenToFieldDetailsSubsecribtion$!: Subscription;
  isEditField: boolean = false;
  saveVisible = true;
  newCreatedFieldsIds: number[] = [];

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    private lookupService: LookupService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<DynamicModel>,
    private toast: ToastService,
    private dialogService: DialogService,
  ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.processForm = new ProcessFieldBuilder();
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    const templateModel = new TemplateField();
    this.fieldForm = this.fb.group({
      ...templateModel.buildForm(),
      options: this.fb.array([])
    });
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
      this.fieldForm.disable();
      this.processForm.buildMode = 'use';
    }
  }
  get isViewForm() {
    return this.operation === OperationTypes.VIEW
  }
  get isCreateForm() {
    return this.operation === OperationTypes.CREATE
  }
  addOption() {
    this.options.push(
      this.fb.group({
        id: [v4()],
        name: ['', Validators.required]
      })
    );
  }
  removeOption(index: number) {
    this.options.removeAt(index);
  }
  handleFieldTypeChange(type: number) {
    if (type == TemplateFieldTypes.selectField) {
      this.addOption();
    }
  }
  initPopup(): void {
    if (this.model?.id) {
      this.processForm.generateFromString(this.model?.template)
    }
    this.listenToFieldDetailsSubsecribtion$ = ProcessFieldBuilder.listenToSelectField().subscribe((fieldId: string) => {
      if (fieldId) {
        const field = this.processForm.getFieldById(fieldId);
        this.fieldForm.reset();
        if (field) {
          this.fieldForm = this.fb.group({
            ...field.buildForm(),
            options: this.fb.array([])
          });
          field.options.forEach((o) => {
            this.options.push(
              this.fb.group({
                id: [o.id],
                name: [o.name, Validators.required]
              })
            )
          })
          this.isEditField = true;
        }
      }
    })
  }
  get isNewCreatedField() {
    return (this.isEditField && this.newCreatedFieldsIds.indexOf(this.fieldForm.value.identifyingName) != -1) || !this.isEditField;
  }
  submitField(form: UntypedFormGroup) {
    if (!this.processForm.fields.filter(f => f.identifyingName == form.value.identifyingName).length || this.isEditField) {
      if (!this.isEditField) {
        if (this.processForm.fields.findIndex(f => f.order == form.value.order) != -1) {
          this.toast.error(this.lang.map.msg_field_order_is_already_exist);
          return
        }
        this.newCreatedFieldsIds.push(form.value.identifyingName)
      }
      this.processForm.setField(form);
      this.isEditField = false;
      while (this.options.length !== 0) {
        this.options.removeAt(0)
      }
    } else
      this.toast.error(this.lang.map.msg_field_identifier_is_already_exist);
  }
  deleteField(form: UntypedFormGroup) {
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_x.change({ x: form.value.identifyingName }))
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.processForm.deleteField(form);
          this.isEditField = false;
          const index = this.newCreatedFieldsIds.indexOf(form.value.identifyingName);
          this.newCreatedFieldsIds.splice(index, 1);
        }
      });
  }
  resetFieldForm() {
    this.fieldForm.reset();
    this.isEditField = false;
  }
  beforeSave(model: DynamicModel, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (!this.processForm.fields.filter(f => f.status).length) {
      this.toast.error(this.lang.map.must_have_one_active_field_at_least)
      return false;
    }
    if (!this.processForm.fields.filter(f => f.required).length) {
      this.toast.error(this.lang.map.must_have_one_required_field_at_least)
      return false;
    }
    if (!this.processForm.fields.filter(f => f.showOnTable).length) {
      this.toast.error(this.lang.map.must_have_one_field_at_least_shown_on_table)
      return false;
    }
    return form.valid;
  }
  prepareModel(model: DynamicModel, form: UntypedFormGroup): DynamicModel | Observable<DynamicModel> {
    return (new DynamicModel()).clone({
      ...model, ...form.value,
      template: this.processForm.generateAsString()
    });
  }
  afterSave(model: DynamicModel, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }
  get isSelectField() {
    return this.fieldForm.value.type == TemplateFieldTypes.selectField
  }
  get dynamicModelTemplateFieldTypesList() {
    var keys = Object.keys(TemplateFieldTypes);
    return keys.slice(keys.length / 2);
  }
  get title(): keyof ILanguageKeys {
    if (this.operation === OperationTypes.CREATE) {
      return 'lbl_add_coordination_with_organizations_template';
    } else if (this.operation === OperationTypes.UPDATE) {
      return 'lbl_edit_coordination_with_organizations_template';
    } else {
      return 'view';
    }
  };
  get statusField() {
    return this.fieldForm.controls['status'] as UntypedFormArray;
  }
  get showOnTableField() {
    return this.fieldForm.controls['showOnTable'] as UntypedFormArray;
  }
  get options() {
    return this.fieldForm.controls["options"] as UntypedFormArray;
  }
  getLabel(name: any) {
    return this.lang.map[('lbl_' + name) as keyof ILanguageKeys];
  }

  saveFail(error: Error): void {
  }
  destroyPopup(): void {
    this.listenToFieldDetailsSubsecribtion$.unsubscribe();
  }
}
