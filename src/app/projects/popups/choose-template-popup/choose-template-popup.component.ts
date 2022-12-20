import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {LangService} from "@services/lang.service";
import {ProjectModel} from "@app/models/project-model";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {TableComponent} from "@app/shared/components/table/table.component";
import {ProjectWorkArea} from "@app/enums/project-work-area";

@Component({
  selector: 'choose-template',
  templateUrl: './choose-template-popup.component.html',
  styleUrls: ['./choose-template-popup.component.scss']
})
export class ChooseTemplatePopupComponent implements AfterViewInit {
  public displayedColumns: string[] = ['checkbox', 'projectName', 'serial', 'country', 'status', 'totalCost']
  @ViewChild(TableComponent) private table!: TableComponent;

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { templates: ProjectModel[], templateId: string, workArea: ProjectWorkArea },
              private dialogRef: DialogRef,
              public lang: LangService) {
    this.data.workArea === ProjectWorkArea.OUTSIDE_QATAR ? this.displayedColumns.splice(3, 0, 'domain') : null;
  }

  ngAfterViewInit(): void {
    this.data.templateId ? this.table.selection.setSelection(this.data.templates.find((item) => item.id === this.data.templateId)) : null
  }

  close(): void {
    this.dialogRef.close(undefined)
  }

  save(): void {
    if (this.isSaveDisabled())
      return;

    this.dialogRef.close((this.table.selection.selected[0] as unknown as ProjectModel).normalizeTemplate())
  }

  isSaveDisabled(): boolean {
    return !this.table ? true : this.table && this.table.selection && this.table.selection.isEmpty()
  }
}
