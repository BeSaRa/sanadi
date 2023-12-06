import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ProjectModel } from '@app/models/project-model';
import { ProjectModelComponent } from '@app/modules/services/project-models/pages/project-model/project-model.component';
import { LangService } from '@app/services/lang.service';
import { ProjectModelService } from '@app/services/project-model.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'project-model-preview',
  templateUrl: './project-model-preview.component.html',
  styleUrls: ['./project-model-preview.component.scss']
})
export class ProjectModelPreviewComponent implements AfterViewInit {
  @ViewChild(ProjectModelComponent) projectModelComponent!: ProjectModelComponent;
  constructor(
    public lang: LangService,
    private projectModelService: ProjectModelService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      id: string,
    },
  ) { }

  ngAfterViewInit(): void {
    this.projectModelService.getById(this.data.id).subscribe((model: ProjectModel) => {
      this.projectModelComponent.operation = OperationTypes.VIEW;
      this.projectModelComponent.readonly = true;
      this.projectModelComponent.outModel = model;
      this.projectModelComponent.fromDialog = true;
      this.projectModelComponent._afterBuildForm();
      this.projectModelComponent.attachmentComponent.forceReload()
    })
  }
  close(): void {
    this.dialogRef.close(undefined)
  }

}
