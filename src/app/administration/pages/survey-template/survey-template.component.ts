import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {SurveyTemplateService} from '@app/services/survey-template.service';
import {SurveyTemplate} from '@app/models/survey-template';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {DialogService} from "@app/services/dialog.service";
import {filter, switchMap} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ToastService} from "@app/services/toast.service";

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
    private toast: ToastService,
    private dialog: DialogService,
  ) {
    super();
  }

  deleteBulk(): void {

  }

  deleteTemplate(item: SurveyTemplate) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: item.getName()}))
      .onAfterClose$
      .pipe(filter(click => UserClickOn.YES === click))
      .pipe(switchMap(_ => item.delete()))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: item.getName()}));
        this.reload$.next(null);
      })
  }

  viewTemplate(row: SurveyTemplate) {
    row.view().onAfterClose$.subscribe(this.reload$)
  }

  editTemplate(row: SurveyTemplate): void {
    !row.usedBefore && this.edit$.next(row);
  }
}
