import { FormBuilder } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { Localization } from '@app/models/localization';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { TableComponent } from '@app/shared/components/table/table.component';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';

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
  constructor(
    public service: LangService,
    private fb: FormBuilder
  ) {
    super();
    this.lang = service;
  }
  _init(): void {
    this.buildFilterForm()
  }
  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['localizationKey', 'arName', 'enName', 'actions'];
  searchColumns: string[] = ['search_localizationKey', 'search_arName', 'search_enName', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_localizationKey: {
      key: 'localizationKey',
      controlType: 'text',
      property: 'localizationKey',
      label: 'lbl_localization_key',
      maxLength: 150
    }
  }
  actions: IMenuItem<Localization>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: Localization) => this.edit$.next(item)
    }
  ];
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], localizationKey: ['']
    })
  }
}
