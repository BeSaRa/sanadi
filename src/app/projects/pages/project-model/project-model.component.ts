import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectModel} from "@app/models/project-model";
import {LangService} from '@app/services/lang.service';
import {ProjectModelService} from "@app/services/project-model.service";
import {Observable} from 'rxjs';

@Component({
  selector: 'project-model',
  templateUrl: './project-model.component.html',
  styleUrls: ['./project-model.component.scss']
})
export class ProjectModelComponent extends EServicesGenericComponent<ProjectModel, ProjectModelService> {
  form!: FormGroup;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: ProjectModelService) {
    super();
  }

  _getNewInstance(): ProjectModel {
    return new ProjectModel();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    this.form = this.fb.group({});
  }

  _afterBuildForm(): void {
    // throw new Error('Method not implemented.');
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // throw new Error('Method not implemented.');
    return true;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    // throw new Error('Method not implemented.');
    return true;
  }

  _afterLaunch(): void {
    // throw new Error('Method not implemented.');
  }

  _prepareModel(): ProjectModel | Observable<ProjectModel> {
    return new ProjectModel().clone({});
  }

  _afterSave(model: ProjectModel, saveType: SaveTypes, operation: OperationTypes): void {
    // throw new Error('Method not implemented.');
  }

  _saveFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: ProjectModel | undefined): void {
    // throw new Error('Method not implemented.');
  }

  _resetForm(): void {
    // throw new Error('Method not implemented.');
  }

}
