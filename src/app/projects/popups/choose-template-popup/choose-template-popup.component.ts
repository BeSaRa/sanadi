import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {LangService} from "@services/lang.service";
import {ProjectModel} from "@app/models/project-model";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {TableComponent} from "@app/shared/components/table/table.component";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {LookupService} from "@services/lookup.service";
import {Lookup} from "@app/models/lookup";
import {ProjectTemplate} from "@app/models/projectTemplate";
import {PublicTemplateStatus} from "@app/enums/public-template-status";

@Component({
  selector: 'choose-template',
  templateUrl: './choose-template-popup.component.html',
  styleUrls: ['./choose-template-popup.component.scss']
})
export class ChooseTemplatePopupComponent implements AfterViewInit {
  public displayedColumns: string[] = ['checkbox', 'projectName', 'serial', 'country', 'status', 'totalCost']
  private needReview = (new Lookup().clone({
    arName: this.lang.getArabicLocalByKey('need_review'),
    enName: this.lang.getEnglishLocalByKey('need_review')
  }))
  private noNeedReview = (new Lookup().clone({
    arName: this.lang.getArabicLocalByKey('no_need_review'),
    enName: this.lang.getEnglishLocalByKey('no_need_review')
  }))

  private oldTemplate?: ProjectTemplate

  @ViewChild(TableComponent)
  private table!: TableComponent;

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { templates: ProjectModel[], template?: ProjectTemplate, workArea: ProjectWorkArea },
              private dialogRef: DialogRef,
              public lang: LangService) {
    this.data.workArea === ProjectWorkArea.OUTSIDE_QATAR ? this.displayedColumns.splice(3, 0, 'domain') : null;
    this.oldTemplate = data.template
  }

  ngAfterViewInit(): void {
    this.data.template ? this.table.selection.setSelection(this.data.templates.find((item) => item.id === this.data.template?.templateId)) : null
  }

  close(): void {
    this.dialogRef.close(undefined)
  }

  save(): void {
    if (this.isSaveDisabled())
      return;

    const model = (this.table.selection.selected[0] as unknown as ProjectModel)
    const noNeedReview = model.templateStatus === PublicTemplateStatus.APPROVED_BY_RACA
    const defaultTemplate = noNeedReview ? this.noNeedReview : this.needReview

    const template = model.normalizeTemplate().clone({
      templateStatus: defaultTemplate.lookupKey,
      templateStatusInfo: defaultTemplate.convertToAdminResult()
    })

    this.dialogRef.close(
      this.oldTemplate && this.oldTemplate.templateId === template.templateId ? this.oldTemplate : template
    )
  }

  isSaveDisabled(): boolean {
    return !this.table ? true : this.table && this.table.selection && this.table.selection.isEmpty()
  }
}
