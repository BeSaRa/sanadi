import { UntypedFormArray, Validators } from '@angular/forms';
import { LookupService } from './../../../services/lookup.service';
import { Lookup } from './../../../models/lookup';
import { UserClickOn } from './../../../enums/user-click-on.enum';
import { DialogService } from './../../../services/dialog.service';
import { ProcessFieldBuilder } from './process-formly-components/process-fields-builder';
import { catchError, map } from 'rxjs/operators';
import { CustomValidators } from './../../../validators/custom-validators';
import { GeneralProcessTemplate } from './../../../models/general-process-template';
import { InternalDepartment } from '@app/models/internal-department';
import { InternalDepartmentService } from './../../../services/internal-department.service';
import { Team } from './../../../models/team';
import { AdminLookupTypeEnum } from './../../../enums/admin-lookup-type-enum';
import { AdminLookup } from './../../../models/admin-lookup';
import { AdminLookupService } from '@services/admin-lookup.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DIALOG_DATA_TOKEN } from './../../../shared/tokens/tokens';
import { DialogRef } from './../../../shared/models/dialog-ref';
import { LangService } from './../../../services/lang.service';
import { IDialogData } from './../../../interfaces/i-dialog-data';
import { ToastService } from './../../../services/toast.service';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from './../../../enums/operation-types.enum';
import { GeneralProcess } from './../../../models/genral-process';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Component, Inject } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { SubTeamService } from '@app/services/sub-team.service';
import { SubTeam } from '@app/models/sub-team';
import { GeneralProcessTemplateFieldTypes } from '@app/enums/general-process-template-field-types.enum';
import { v4 } from 'uuid';

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
  GeneralProcessTypeList: Lookup[] = this.lookupService.listByCategory.GeneralProcessType;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  processForm: ProcessFieldBuilder;
  listenToFieldDetailsSubsecribtion$!: Subscription;
  isEditForm: boolean = false;
  saveVisible = true;
  mainClassificationsList: AdminLookup[] = [];
  subClassificationsList: AdminLookup[] = [];
  departmentList: InternalDepartment[] = [];
  private _teamsList: Team[] = [];
  subTeamsList: SubTeam[] = [];

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
    const templateModel = new GeneralProcessTemplate();
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
    if (type == GeneralProcessTemplateFieldTypes.selectField) {
      this.addOption();
    }
  }
  initPopup(): void {
    this.adminLookupService.loadGeneralProcessClassificaion().subscribe(data => {
      this.mainClassificationsList = data;
    })
    this.internalDepartmentService.loadGeneralProcessDepartments().subscribe(deparments => {
      this.departmentList = deparments;
    })
    if (this.model?.id) {
      this._loadSubTeam(this.model?.teamId);
      this.loadSubClasses(this.model?.mainClass)
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
        this.isEditForm = true;
      }
    })
  }
  submitField(form: UntypedFormGroup) {
    if (!this.processForm.fields.filter(f => f.identifyingName == form.value.identifyingName).length || this.isEditForm) {
      this.processForm.setField(form);
      this.isEditForm = false;
      while (this.options.length !== 0) {
        this.options.removeAt(0)
      }
    } else
      this.toast.error(this.lang.map.msg_user_identifier_is_already_exist);
  }
  deleteField(form: UntypedFormGroup) {
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_x.change({ x: form.value.identifyingName }))
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.processForm.deleteField(form);
          this.isEditForm = false;
        }
      });
  }
  loadSubClasses(parentId: number) {
    this.adminLookupService.loadByParentId(AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION, parentId).subscribe(data => {
      this.subClassificationsList = data;
    })
  }
  private _loadSubTeam(parentTeamId?: number) {
    if (parentTeamId)
      this.subTeamService.loadAsLookups().pipe(
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
    this.isEditForm = false;
  }
  beforeSave(model: GeneralProcess, form: UntypedFormGroup): boolean | Observable<boolean> {
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
    return this.fieldForm.value.type == GeneralProcessTemplateFieldTypes.selectField
  }
  get generalProcessTemplateFieldTypesList() {
    var keys = Object.keys(GeneralProcessTemplateFieldTypes);
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
  getLabel(name: any) {
    return this.lang.map[('lbl_' + name) as keyof ILanguageKeys];
  }

  saveFail(error: Error): void {
  }
  destroyPopup(): void {
    this.listenToFieldDetailsSubsecribtion$.unsubscribe();
  }
}
