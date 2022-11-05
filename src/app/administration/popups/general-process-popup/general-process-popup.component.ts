import { ProcessFieldBuilder } from './process-formly-components/process-fields-builder';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';
import { CustomGeneralProcessFieldConfig, ISelectOption } from './../../../interfaces/custom-general-process-field';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { CustomValidators } from './../../../validators/custom-validators';
import { GenerealProcessTemplate } from './../../../models/general-process-template';
import { InternalDepartment } from '@app/models/internal-department';
import { InternalDepartmentService } from './../../../services/internal-department.service';
import { Team } from './../../../models/team';
import { TeamService } from './../../../services/team.service';
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
import { Observable, of } from 'rxjs';
import { SubTeamService } from '@app/services/sub-team.service';
import { SubTeam } from '@app/models/sub-team';
import { GeneralProcessTemplateFieldTypes } from '@app/enums/general-process-template-field-types.enum';

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
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  processForm: ProcessFieldBuilder;

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
    private toast: ToastService,
    private teamService: TeamService,
    private internalDepartmentService: InternalDepartmentService,
    private subTeamService: SubTeamService,
    private adminLookupService: AdminLookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.processForm = new ProcessFieldBuilder();
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
    const templateModel = new GenerealProcessTemplate();
    this.fieldForm = this.fb.group(templateModel.buildForm(true));
  }

  initPopup(): void {
    this.adminLookupService.loadGeneralProcessClassificaion().subscribe(data => {
      this.mainClassificationsList = data;
    })
    this.teamService.loadAsLookups().pipe(
      switchMap((teams) => {
        return this.internalDepartmentService.loadGeneralProcessDepartments()
          .pipe(
            tap((deparments) => {
              this._teamsList = teams.filter(team => deparments.findIndex(deparment => team.parentDeptId == deparment.id) != -1);
            }))
      })
    ).subscribe(deparments => {
      this.departmentList = deparments;
    })
    if (this.model?.id) {
      this._loadSubTeam(this.model?.teamId);
      this.loadSubClasses(this.model?.mainClass)
    }
  }
  loadSubClasses(parentId: number) {
    this.adminLookupService.loadByParentId(AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION, parentId).subscribe(data => {
      this.subClassificationsList = data;
    })
  }
  private _loadSubTeam(teamId?: number) {
    if (teamId)
      this.subTeamService.getByParentId(teamId).pipe(catchError(err => of([]))).subscribe(data => {
        this.subTeamsList = data;
      })
    else this.subTeamsList = [];
  }
  handleDepartmentChange() {
    this.teamField.reset();
    this.handleTeamChange();
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
  }
  beforeSave(model: GeneralProcess, form: UntypedFormGroup): boolean | Observable<boolean> {
    return form.valid;
  }
  prepareModel(model: GeneralProcess, form: UntypedFormGroup): GeneralProcess | Observable<GeneralProcess> {
    return (new GeneralProcess()).clone({
      ...model, ...form.value,
      template: JSON.stringify(this.processForm.fieldsGroups)
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
  }
}
