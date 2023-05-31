import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { ProjectCompletion } from '@app/models/project-completion';
import { LangService } from '@app/services/lang.service';
import { ProjectCompletionService } from '@app/services/project-completion.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-completion',
  templateUrl: './project-completion.component.html',
  styleUrls: ['./project-completion.component.scss']
})
export class ProjectCompletionComponent extends EServicesGenericComponent<ProjectCompletion, ProjectCompletionService> {
  form!: UntypedFormGroup;

  // formProperties = {
  //   requestType: () => {
  //     return this.getObservableField('requestType', 'requestType');
  //   }
  // }
  constructor(
    public service: ProjectCompletionService,
    public lang: LangService,
    public fb: UntypedFormBuilder
  ) {
    super();
  }

  _getNewInstance(): ProjectCompletion {
    return new ProjectCompletion();
  }
  _initComponent(): void {
  }
  _buildForm(): void {
    const model = new ProjectCompletion()
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.formBuilder(true).basicInfo),
      explanation: this.fb.group(model.formBuilder(true).explanation)
    })
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return true;
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }
  _afterLaunch(): void {
  }
  _prepareModel(): ProjectCompletion | Observable<ProjectCompletion> {
    return new ProjectCompletion();
  }
  _afterSave(model: ProjectCompletion, saveType: SaveTypes, operation: OperationTypes): void {
  }
  _saveFail(error: any): void {
  }
  _launchFail(error: any): void {
  }
  _destroyComponent(): void {
  }
  _updateForm(model: ProjectCompletion | undefined): void {
  }
  _resetForm(): void {
  }

}
