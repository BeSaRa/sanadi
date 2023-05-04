import { ComponentType } from '@angular/cdk/portal';
import { Component, Input } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ProjectModelForeignCountriesProject } from '@app/models/project-model-foreign-countries-project';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { ForeignCountriesProjectPopupComponent } from '../../../popups/foreign-countries-project-popup/foreign-countries-project-popup.component';
import { ForeignCountriesProjectsNeed } from '@app/models/foreign-countries-projects-need';

@Component({
  selector: 'foreign-countries-projects',
  templateUrl: './foreign-countries-projects.component.html',
  styleUrls: ['./foreign-countries-projects.component.scss']
})
export class ForeignCountriesProjectsComponent extends UiCrudListGenericComponent<ProjectModelForeignCountriesProject> {
  @Input() ForeignCountriesProjectsNeeds!: ForeignCountriesProjectsNeed[];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }
  actions: IMenuItem<ProjectModelForeignCountriesProject>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ProjectModelForeignCountriesProject) => !this.readonly && this.edit$.next(item),
      show: (_item: ProjectModelForeignCountriesProject) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ProjectModelForeignCountriesProject) => this.confirmDelete$.next(item),
      show: (_item: ProjectModelForeignCountriesProject) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ProjectModelForeignCountriesProject) => this.view$.next(item),
    }
  ];
  displayColumns: string[] = ['index', 'projectName', 'notes', 'actions'];

  _getNewInstance(override?: Partial<ProjectModelForeignCountriesProject> | undefined): ProjectModelForeignCountriesProject {
    return new ProjectModelForeignCountriesProject().clone(override?? {})
  }
  _getDialogComponent(): ComponentType<any> {
    return ForeignCountriesProjectPopupComponent
  }
  _getDeleteConfirmMessage(record: ProjectModelForeignCountriesProject): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.projectName});
  }
  getExtraDataForPopup(): IKeyValue {
    return {
      foreignCountriesProjectsNeeds:this.ForeignCountriesProjectsNeeds
    }
  }

}
