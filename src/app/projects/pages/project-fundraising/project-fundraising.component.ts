import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { ProjectFundraising } from "@app/models/project-fundraising";
import { LangService } from '@app/services/lang.service';
import { ProjectFundraisingService } from "@services/project-fundraising.service";
import { Observable } from 'rxjs';

@Component({
  selector: 'project-fundraising',
  templateUrl: './project-fundraising.component.html',
  styleUrls: ['./project-fundraising.component.scss']
})
export class ProjectFundraisingComponent extends EServicesGenericComponent<ProjectFundraising, ProjectFundraisingService> {
  form!: UntypedFormGroup;


  constructor(public service: ProjectFundraisingService, public fb: UntypedFormBuilder, public lang: LangService) {
    super()
  }

  _getNewInstance(): ProjectFundraising {
    return new ProjectFundraising()
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    this.form = this.fb.group({})
  }

  _afterBuildForm(): void {
    // throw new Error('Method not implemented.');
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }

  _prepareModel(): ProjectFundraising | Observable<ProjectFundraising> {
    throw new Error('Method not implemented.');
  }

  _afterSave(model: ProjectFundraising, saveType: SaveTypes, operation: OperationTypes): void {
    throw new Error('Method not implemented.');
  }

  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }

  _updateForm(model: ProjectFundraising | undefined): void {
    throw new Error('Method not implemented.');
  }

  _resetForm(): void {
    throw new Error('Method not implemented.');
  }
}
