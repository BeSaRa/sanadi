import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ProjectModel} from "@app/models/project-model";
import {ProjectModelService} from "@app/services/project-model.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Component({
  selector: 'select-template-popup',
  templateUrl: './select-template-popup.component.html',
  styleUrls: ['./select-template-popup.component.scss']
})
export class SelectTemplatePopupComponent implements OnInit {
  displayedColumns: string[] = ['projectName','domainInfo', 'projectTypeInfo', 'templateStatusInfo', 'createdBy', 'createdOn', 'actions'];

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { list: ProjectModel[], service: ProjectModelService }) {
  }

  ngOnInit(): void {
  }

  selectModel(model: ProjectModel) {
    this.data.service.getTemplateById(model.id)
      .subscribe((model) => {
        this.dialogRef.close(model);
      });
  }
}
