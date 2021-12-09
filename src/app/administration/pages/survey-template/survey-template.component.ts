import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { SurveyTemplateService } from '@app/services/survey-template.service';
import { SurveyTemplate } from '@app/models/survey-template';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { IGridAction } from '@app/interfaces/i-grid-action';

@Component({
  selector: 'survey-template',
  templateUrl: './survey-template.component.html',
  styleUrls: ['./survey-template.component.scss'],
})
export class SurveyTemplateComponent extends AdminGenericComponent<SurveyTemplate, SurveyTemplateService> {
  useCompositeToLoad = false;
  actions: IMenuItem<SurveyTemplate>[] = [
    {
      type: 'action',
      onClick: () => this.reload$.next(null),
      icon: 'mdi mdi-reload',
      label: 'btn_reload',
    },
  ];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  bulkActions: IGridAction[] = [
    {
      icon: 'mdi mdi-delete',
      langKey: 'btn_delete',
      callback: () => this.deleteBulk(),
    },
  ];

  constructor(
    public service: SurveyTemplateService,
    public lang: LangService,
  ) {
    super();
  }

  deleteBulk(): void {

  }

  deleteTemplate(item: SurveyTemplate) {

  }
}
