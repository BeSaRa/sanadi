import {Component, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {Localization} from '@app/models/localization';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TableComponent} from '@app/shared/components/table/table.component';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent extends AdminGenericComponent<Localization, LangService> {
  useCompositeToLoad = false;
  useCompositeToEdit = false;
  lang: LangService;

  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  constructor(public service: LangService) {
    super();
    this.lang = service;
  }
  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['localizationKey', 'arName', 'enName', 'actions'];
  actions: IMenuItem<Localization>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: Localization) => this.edit$.next(item)
    }
  ];
}
