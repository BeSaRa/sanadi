import { UntypedFormArray, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { InternalDepartment } from '@app/models/internal-department';
import { AdminLookupService } from '@services/admin-lookup.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Component, Inject } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { SubTeamService } from '@app/services/sub-team.service';
import { SubTeam } from '@app/models/sub-team';
import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { v4 } from 'uuid';
import { GeneralProcess } from '@app/models/genral-process';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { Lookup } from '@app/models/lookup';
import { CustomValidators } from '@app/validators/custom-validators';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { AdminLookup } from '@app/models/admin-lookup';
import { Team } from '@app/models/team';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { LangService } from '@app/services/lang.service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LookupService } from '@app/services/lookup.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { ToastService } from '@app/services/toast.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { DialogService } from '@app/services/dialog.service';
import { TemplateField } from '@app/models/template-field';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';

@Component({
  selector: 'app-general-process-popup',
  templateUrl: './general-process-popup.component.html',
  styleUrls: ['./general-process-popup.component.scss']
})
export class GeneralProcessPopupComponent extends AdminGenericDialog<GeneralProcess> {
  form!: UntypedFormGroup;
  fieldForm!: UntypedFormGroup;
  model!: GeneralProcess;
  operation: OperationTypes;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  GeneralProcessTypeList: Lookup[] = this.lookupService.listByCategory.GeneralProcessType;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  processForm: ProcessFieldBuilder;
  listenToFieldDetailsSubsecribtion$!: Subscription;
  isEditField: boolean = false;
  saveVisible = true;
  mainClassificationsList: AdminLookup[] = [];
  _subClassificationsList: AdminLookup[] = [];
  subClassificationsList: AdminLookup[] = [];
  departmentList: InternalDepartment[] = [];
  private _teamsList: Team[] = [];
  subTeamsList: SubTeam[] = [];
  newCreatedFieldsIds: number[] = [];

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<GeneralProcess>,
    private lookupService: LookupService,
    private toast: ToastService,
    private internalDepartmentService: InternalDepartmentService,
    private subTeamService: SubTeamService,
    private dialogService: DialogService,
    private adminLookupService: AdminLookupService) {
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
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION, true).subscribe((data: AdminLookup[]) => {
      this.mainClassificationsList = data.filter(c => !c.parentId);
      this._subClassificationsList = data.filter(c => !!c.parentId);
      if (this.model?.mainClass) {
        this.subClassificationsList = this._subClassificationsList.filter(sc => sc.parentId == this.model?.mainClass);
      }
    })
    this.internalDepartmentService.loadGeneralProcessDepartments().subscribe(deparments => {
      this.departmentList = deparments;
    })
    if (this.model?.id) {
      this._loadSubTeam(this.model?.teamId);
      this.handleMainCatChange(this.model?.mainClass)
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
        }
        this.isEditField = true;
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
  handleMainCatChange(parentId: number) {
    this.subClassField.reset();
    this.subClassificationsList = this._subClassificationsList.filter(sc => sc.parentId == parentId);
  }
  private _loadSubTeam(parentTeamId?: number) {
    if (parentTeamId)
      this.subTeamService.loadActive().pipe(
        map((teams) => teams.filter((team: SubTeam) => parentTeamId == team.parent)), catchError(err => of([]))).subscribe(data => {
          this.subTeamsList = data;
        })
    else this.subTeamsList = [];
  }
  handleDepartmentChange() {
    this.teamField.setValue(this.departmentList.find(d => d.id == this.departmentField.value)?.mainTeam.id);
    this.handleTeamChange(this.teamField.value);
  }
  handleTeamChange(teamId?: number) {
    this.subTeamField.reset();
    this._loadSubTeam(teamId);
  }
  get teamsList() {
    return this._teamsList.filter(team => !this.departmentField.value || team.parentDeptId == this.departmentField.value)
  }

  resetFieldForm() {
    this.fieldForm.reset();
    this.isEditField = false;
  }
  beforeSave(model: GeneralProcess, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (!this.processForm.fields.filter(f => f.status).length) {
      this.toast.error(this.lang.map.must_have_one_active_field_at_least)
      return false;
    }
    if (!this.processForm.fields.filter(f => f.required).length) {
      this.toast.error(this.lang.map.must_have_one_required_field_at_least)
      return false;
    }
    return form.valid;
  }
  prepareModel(model: GeneralProcess, form: UntypedFormGroup): GeneralProcess | Observable<GeneralProcess> {
    return (new GeneralProcess()).clone({
      ...model, ...form.value,
      template: this.processForm.generateAsString()
    });
  }
  afterSave(model: GeneralProcess, dialogRef: DialogRef): void {
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
  get generalProcessTemplateFieldTypesList() {
    var keys = Object.keys(TemplateFieldTypes);
    return keys.slice(keys.length / 2);
  }
  get title(): keyof ILanguageKeys {
    if (this.operation === OperationTypes.CREATE) {
      return 'lbl_add_process_template';
    } else if (this.operation === OperationTypes.UPDATE) {
      return 'lbl_edit_process_template';
    } else {
      return 'view';
    }
  };
  get statusField() {
    return this.fieldForm.controls['status'] as UntypedFormArray;
  }
  get options() {
    return this.fieldForm.controls["options"] as UntypedFormArray;
  }
  get departmentField(): UntypedFormControl {
    return this.form.get('departmentId') as UntypedFormControl
  }
  get teamField(): UntypedFormControl {
    return this.form.get('teamId') as UntypedFormControl
  }
  get subTeamField(): UntypedFormControl {
    return this.form.get('subTeamId') as UntypedFormControl
  }
  get subClassField(): UntypedFormControl {
    return this.form.get('subClass') as UntypedFormControl
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
