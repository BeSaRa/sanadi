import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ForeignCountriesProjectsNeed} from '@app/models/foreign-countries-projects-need';
import {ProjectModelForeignCountriesProject} from '@app/models/project-model-foreign-countries-project';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'foreign-countries-project-popup',
  templateUrl: './foreign-countries-project-popup.component.html',
  styleUrls: ['./foreign-countries-project-popup.component.scss']
})
export class ForeignCountriesProjectPopupComponent extends UiCrudDialogGenericComponent<ProjectModelForeignCountriesProject> {
  model: ProjectModelForeignCountriesProject;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  foreignCountriesProjectsNeeds!: ForeignCountriesProjectsNeed[];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ProjectModelForeignCountriesProject>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
    this.foreignCountriesProjectsNeeds = (data.extras && data.extras.foreignCountriesProjectsNeeds) ?? [];
  }

  _getNewInstance(override?: Partial<ProjectModelForeignCountriesProject> | undefined): ProjectModelForeignCountriesProject {
    return new ProjectModelForeignCountriesProject().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'project_model_foreign_countries_projects';
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ProjectModelForeignCountriesProject, originalModel: ProjectModelForeignCountriesProject): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: ProjectModelForeignCountriesProject, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: ProjectModelForeignCountriesProject, form: UntypedFormGroup): Observable<ProjectModelForeignCountriesProject> | ProjectModelForeignCountriesProject {
    let formValue = form.getRawValue();
    let projectName = (this.foreignCountriesProjectsNeeds.find(x => x.id === formValue.objectDBId)! as any).projectName;
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      projectName
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }
}
